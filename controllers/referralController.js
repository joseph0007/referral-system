const Referral = require('../Models/ReferralModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.getAllReferrals = factory.GenericGetAll(Referral);
exports.getReferral = factory.GenericGetOne(Referral);

exports.getAllReferralsUser = catchAsync(async(req, res, next) => {
  const { 
    query
  } = req;

  if( typeof query !== 'object' ) {
    console.log("No query provided");
    throw new AppError();      
  }

  let queryData = await Referral.find({
    referreeId: query.id
  });

  const doc = await queryData;

  res.status(200).json({
    status: 'success',
    data: {
      data: doc || [],
    },
  });
});