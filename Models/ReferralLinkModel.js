const mongoose = require('mongoose');

const referralLinkSchema = mongoose.Schema({
  referralLink: {
    type: String,
    required: true
  },
  belongsTo: {
    type: mongoose.Schema.ObjectId,
    ref: "users"
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
    type: mongoose.Schema.ObjectId,
    ref: "users",
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
