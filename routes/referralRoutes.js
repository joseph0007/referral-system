const express = require('express');
const {
  getAllReferrals,
  getReferral,
  getAllReferralsUser
} = require('../controllers/referralController');
const { buildQueryData } = require('../utils/utils');
const { protect } = require('../controllers/authController');
const referralLinkRoutes = require("./referralLinkRoutes");

const Router = express.Router();

Router.use('/referral-links', referralLinkRoutes);

Router.use((req, res, next) => {
  req.type = 'referral';
  next();
});

Router.use(protect);

Router.get('/users/:id', buildQueryData, getAllReferralsUser);

Router.route('/')
  .get(buildQueryData, getAllReferrals);
Router.route('/:id')
  .get(buildQueryData, getReferral);

module.exports = Router;
