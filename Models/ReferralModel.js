const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
  referralId: {
    type: mongoose.Types.ObjectId,
  },
  referreeId: {
    type: mongoose.Types.ObjectId,
  },
  score: {
    type: Number,
    default: 0
  },
  referralLinkId: {
    type: mongoose.Types.ObjectId,
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
  }
});

const Referrals = mongoose.model('referrals', referralSchema);

module.exports = Referrals;
