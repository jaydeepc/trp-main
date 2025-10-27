const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  adminUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'ultra'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'trial'
    },
    expiresAt: Date
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  }
}, {
  timestamps: true
});

OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ status: 1 });

OrganizationSchema.methods.toPublicProfile = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    subscription: this.subscription,
    status: this.status,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Organization', OrganizationSchema);
