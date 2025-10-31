const mongoose = require('mongoose');

const InvitedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
    index: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

InvitedUserSchema.index({ email: 1, organizationId: 1 });
InvitedUserSchema.index({ status: 1, expiresAt: 1 });

InvitedUserSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    status: 'pending'
  }).populate('organizationId', 'name status');
};

InvitedUserSchema.statics.isInvited = async function (email) {
  const invite = await this.findByEmail(email);
  return !!invite;
};

InvitedUserSchema.methods.markAsAccepted = function () {
  this.status = 'accepted';
  return this.save();
};

module.exports = mongoose.model('InvitedUser', InvitedUserSchema);
