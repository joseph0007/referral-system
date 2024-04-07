const express = require('express');
const {
  signUp,
  logIn,
  logout,
  updatePassword,
  protect,
  updateUser,
  deleteMe,
  restrictTo,
  refreshToken
} = require('../controllers/authController');
const userController = require('../controllers/userController');
const { buildQueryData } = require('../utils/utils');

const Router = express.Router({ mergeParams: true });

Router.use((req, res, next) => {
  req.type = 'user';
  next();
});

Router.post('/signup', signUp);
Router.post('/login', logIn);
Router.get('/logout', logout);
Router.post('/refresh-token', refreshToken);

Router.use(protect);

Router.get('/me', userController.getMe, buildQueryData, userController.getUser);

Router.patch('/updatepassword', buildQueryData, updatePassword);
Router.patch('/updateme', buildQueryData, updateUser);
Router.delete('/deleteme', buildQueryData, deleteMe);

Router.route('/')
  .get(buildQueryData, userController.getAllUsers)
  .post(buildQueryData, userController.createUser);

Router.route('/:id')
  .get(buildQueryData, userController.getUser)
  .patch(buildQueryData, userController.updateUser)
  .delete(buildQueryData, userController.deleteUser);

module.exports = Router;
