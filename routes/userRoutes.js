const express = require('express');
const {
  signUp,
  logIn,
  logout,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  updateUser,
  deleteMe,
  restrictTo,
  refreshToken
} = require('../controllers/authController');
const userController = require('../controllers/userController');

const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', logIn);
Router.get('/logout', logout);
Router.post('/forgotpassword', forgotPassword);
Router.patch('/resetpassword/:token', resetPassword);
Router.post('/refresh-token', refreshToken);

Router.use(protect);

Router.get('/me', userController.getMe, userController.getUser);

Router.patch('/updatepassword', updatePassword);
Router.patch('/updateme', updateUser);
Router.delete('/deleteme', deleteMe);

Router.use(restrictTo('admin'));

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
