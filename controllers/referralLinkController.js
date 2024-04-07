const moment = require("moment");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const ReferralLink = require("../Models/ReferralLinkModel");
const { getMsDate } = require("../utils/utils");
const referralCodes = require('voucher-code-generator');

const {
  REFERRAL_EXPIRY = 864000000,
  FRONTEND_URL="http://127.0.0.1:3003"
} = process.env;

exports.createReferralLink = catchAsync(async (req, res, next) => {
  const referralLink = referralCodes.generate({
    length: 8,
    count: 1,
  });

  const referralLinkSave = await ReferralLink.create({
    referralLink: referralLink[0],
    belongsTo: req.user._id,
    expiresAt: new Date( parseInt( moment().format('x'), 10 ) + parseInt(REFERRAL_EXPIRY, 10) ),
    scoreAwarded: 50,
    createdAt: getMsDate(),
    changedAt: getMsDate(),
    changedBy: req.user._id,
  });

  console.log("referralLinkSave ", referralLinkSave);

  res.status(202).json({
    status: 'success',
    message: 'Referral code generated',
    data: {
      referralLink: `${FRONTEND_URL}/signup/${referralLink}`
    },
  });
});