const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Firebase Authentication ID
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullName: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },

  // User Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC+05:30'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      },
      rfqUpdates: {
        type: Boolean,
        default: true
      },
      supplierResponses: {
        type: Boolean,
        default: true
      }
    },
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },

  // Activity Tracking
  lastLoginAt: {
    type: Date,
    default: Date.now
  },

  lastActiveAt: {
    type: Date,
    default: Date.now
  },

  // Metadata
  metadata: {
    signupSource: {
      type: String,
      enum: ['email', 'google'],
      default: 'email'
    },
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ 'profile.company.name': 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// Instance methods
UserSchema.methods.toPublicProfile = function () {
  return {
    id: this._id.toString(),
    firebaseUid: this.firebaseUid,
    email: this.email,
    fullName: this.fullName,
    jobTitle: this.jobTitle,
    department: this.department,
    organizationId: this.organizationId,
    preferences: this.preferences,
    status: this.status,
    lastLoginAt: this.lastLoginAt,
    lastActiveAt: this.lastActiveAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

UserSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  return this.save();
};


// Static methods
UserSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid });
};

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.createFromFirebase = async function (firebaseUser) {
  const user = new this({
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    metadata: {
      signupSource: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'
    }
  });

  return user.save();
};

UserSchema.statics.findOrCreateFromFirebase = async function (firebaseUser) {
  let user = await this.findByFirebaseUid(firebaseUser.uid);

  if (!user) {
    user = await this.createFromFirebase(firebaseUser);
  } else {
    // Update last login
    await user.updateLastLogin();
  }

  return user;
};

module.exports = mongoose.model('User', UserSchema);
