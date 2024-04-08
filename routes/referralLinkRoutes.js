const express = require('express');
const {
  createReferralLink,
  getReferralLink
} = require('../controllers/referralLinkController');
const { buildQueryData } = require('../utils/utils');
const { protect } = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

Router.use((req, res, next) => {
  req.type = 'referralLink';
  next();
});

Router.use(protect);
Router.use(buildQueryData);

// Router.use(restrictTo('admin'));

Router.get('/', getReferralLink);
Router.post('/', createReferralLink);

module.exports = Router;
