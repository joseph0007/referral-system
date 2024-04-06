const User = require('../Models/UserModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

//USER ROUTE HANDLER FUNCTIONS
exports.getAllUsers = factory.GenericGetAll(User);

exports.getUser = factory.GenericGetOne(User);

//because creating new users is done in signup handler!!
exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined please use the /signup route',
  });
};

exports.deleteUser = factory.GenericDeleteOne(User);
exports.updateUser = factory.GenericUpdateOne(User);

//controller to get data about self when logged in!!
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
