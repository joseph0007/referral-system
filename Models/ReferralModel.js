const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
  referralId: {
    type: mongoose.Schema.ObjectId,
    ref: "users"
  },
  referreeId: {
    type: mongoose.Schema.ObjectId,
    ref: "users"
  },
  score: {
    type: Number,
    default: 0
  },
  referralLinkId: {
    type: mongoose.Schema.ObjectId,
    ref: "referralLinks"
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
  }
});

const Referrals = mongoose.model('referrals', referralSchema);

module.exports = Referrals;
