const mongoose = require('mongoose');

const referralLinkSchema = mongoose.Schema({
  referralLink: {
    type: String,
    required: true
  },
  belongsTo: {
    type: mongoose.Types.ObjectId,
  },
  expiresAt: {
    type: Date,
  },
  scoreAwarded: {
    type: Number
  },
  createdAt: {
    type: Date,
  },
  changedAt: {
    type: Date,
  },
  changedBy: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const ReferralLink = mongoose.model('referralLinks', referralLinkSchema);

module.exports = ReferralLink;
