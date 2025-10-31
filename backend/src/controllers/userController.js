const User = require('../models/User');
const InvitedUser = require('../models/InvitedUser');
const Organization = require('../models/Organization');

class UserController {
  // Check user status (invited, registered, or not found)
  async checkUserStatus(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Email is required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user is already registered
      const existingUser = await User.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.json({
          success: true,
          data: {
            status: 'registered',
            email: normalizedEmail
          }
        });
      }

      // Check if user is invited
      const invite = await InvitedUser.findByEmail(normalizedEmail);

      if (invite && invite.organizationId) {
        return res.json({
          success: true,
          data: {
            status: 'invited',
            email: normalizedEmail,
            organizationName: invite.organizationId.name,
            organizationId: invite.organizationId._id,
            role: invite.role
          }
        });
      }

      // User not found
      return res.json({
        success: true,
        data: {
          status: 'not-found',
          email: normalizedEmail
        }
      });

    } catch (error) {
      console.error('Error checking user status:', error);
      res.status(500).json({
        error: 'Failed to check user status',
        message: error.message
      });
    }
  }

  // Sync user from Firebase (create or update)
  async syncUser(req, res) {
    try {
      const { firebaseUser } = req.body;

      if (!firebaseUser || !firebaseUser.uid || !firebaseUser.email) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Firebase user data is required'
        });
      }

      const normalizedEmail = firebaseUser.email.toLowerCase().trim();

      // Check if user was invited
      const invite = await InvitedUser.findByEmail(normalizedEmail);

      // Find or create user
      let user = await User.findByFirebaseUid(firebaseUser.uid);

      if (!user) {
        // Check if user is invited before allowing creation
        if (!invite) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You need an invitation to access this application'
          });
        }

        // Create new user with organization info from invite
        user = new User({
          firebaseUid: firebaseUser.uid,
          email: normalizedEmail,
          fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          organizationId: invite.organizationId,
          role: invite.role,
          metadata: {
            signupSource: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'
          }
        });

        await user.save();

        // Mark invite as accepted
        await invite.markAsAccepted();

        console.log('✅ New user created from invite:', user.email);
      } else {
        // Update existing user
        user.fullName = firebaseUser.displayName || user.fullName;
        user.email = normalizedEmail;
        await user.updateLastLogin();
        console.log('✅ User updated:', user.email);
      }

      res.status(200).json({
        success: true,
        message: user.isNew ? 'User created successfully' : 'User synced successfully',
        data: user.toPublicProfile()
      });

    } catch (error) {
      console.error('Error syncing user:', error);
      res.status(500).json({
        error: 'Failed to sync user',
        message: error.message
      });
    }
  }

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const userId = req.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile does not exist'
        });
      }

      // Update last active
      user.lastActiveAt = new Date();
      await user.save();

      res.json({
        success: true,
        data: user.toPublicProfile()
      });

    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  }

  // Update current user profile
  async updateCurrentUser(req, res) {
    try {
      const userId = req.userId;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.firebaseUid;
      delete updates.email;
      delete updates._id;
      delete updates.createdAt;
      delete updates.metadata;
      delete updates.status;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile does not exist'
        });
      }

      // Update allowed fields
      if (updates.fullName !== undefined) user.fullName = updates.fullName;
      if (updates.jobTitle !== undefined) user.jobTitle = updates.jobTitle;
      if (updates.department !== undefined) user.department = updates.department;
      if (updates.organizationId !== undefined) user.organizationId = updates.organizationId;

      // Update preferences if provided
      if (updates.preferences) {
        user.preferences = {
          ...user.preferences,
          ...updates.preferences
        };
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toPublicProfile()
      });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: 'Failed to update user',
        message: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const userId = req.userId;
      console.log('Fetching stats for user ID:', userId);


      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Get RFQ statistics
      const RFQNew = require('../models/RFQNew');

      const [totalRFQs, activeRFQs, completedRFQs] = await Promise.all([
        RFQNew.countDocuments({ createdBy: userId }),
        RFQNew.countDocuments({ createdBy: userId, status: 'in-progress' }),
        RFQNew.countDocuments({ createdBy: userId, status: 'completed' }),
      ]);

      res.json({
        success: true,
        data: {
          totalRFQs,
          activeRFQs,
          completedRFQs,
          accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // days
          lastLoginAt: user.lastLoginAt,
          lastActiveAt: user.lastActiveAt
        }
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        error: 'Failed to fetch user statistics',
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
