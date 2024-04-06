const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sanityCheck, filterUpdateObject } = require('../utils/utils');

const {
  ACCESS_JWT_EXPIRE,
  JWT_COOKIE_EXPIRE,
  JWT_PRIVATEKEY,
  REFRESH_JWT_EXPIRE
} = process.env;

const createToken = ( id, jwtPrivateKey = JWT_PRIVATEKEY, expiresIn = ACCESS_JWT_EXPIRE ) => {
  return jwt.sign({ id }, jwtPrivateKey, {
    expiresIn,
  });
};

const createSendToken = async (
  user,
  statusCode,
  req,
  res,
  message = 'task sucssesful',
  sendRefresh = true
) => {
  const accessToken  = createToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    httpOnly: true,
  };

  res.cookie('jwt', accessToken, cookieOptions);
  
  user.password = undefined;
  const sendData = {
    status: 'success',
    message,
    accessToken,
    user,
  }

  if( sendRefresh ) {
    const refreshToken = createToken(user._id, JWT_PRIVATEKEY, REFRESH_JWT_EXPIRE);
    res.cookie('refreshjwt', refreshToken, cookieOptions);

    sendData.refreshToken = refreshToken;
  }

  res.status(statusCode).json(sendData);
};

exports.signUp = catchAsync(async (req, res, next) => {
  sanityCheck(req.body);

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    changedAt: req.body.changedAt || Date.now(),
    role: req.body.role,
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;

  await createSendToken(user, 201, req, res);
});

exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email address and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  await createSendToken(user, 200, req, res, 'login successful');
};

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in.Please log in!', 401));
  }

  console.log("token ", token);
  const decoded = await promisify(jwt.verify)(
    token,
    JWT_PRIVATEKEY
  );

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user does not exist!!Please login again!'));
  }

  if (currentUser.isPasswordChangedAfter(decoded.iat)) {
    return next(new AppError('Token has expired.Please login again!!'));
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to do the operation!', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'User does not exist! Please provide a valid email address',
        404
      )
    );
  }

  const token = user.getPasswordResetToken();
  user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}//api/v1/users/resetpassword/${token}`;

  try {
    res.status(200).json({
      status: 'success',
      message: 'token sent to the mail',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.tokenExiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('could not send mial.Please try again later!!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetToken,
    tokenExpiry: { $gt: new Date().toISOString() },
  });

  if (!user) {
    return next(
      new AppError(
        'Invalid token or token has expired.Please repeat forgot Password steps again',
        400
      )
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.tokenExpiry = undefined;

  await user.save();
  await createSendToken(user, 201, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('user not found', 404));
  }

  const isCorrect = await user.isCorrectPassword(
    req.body.password,
    user.password
  );

  if (!isCorrect) {
    return next(new AppError('Please enter the correct current Password', 401));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  await createSendToken(user, 201, req, res, 'password updated successfully');
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You are not authorized to update password using this route. Please use /updatepassword route',
        401
      )
    );
  }

  const updateUser = filterUpdateObject(req.body, 'name', 'email');
  if (req.file) updateUser.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, updateUser, {
    new: true,
    runValidators: true,
  });

  res.status(202).json({
    status: 'success',
    message: 'fields updated',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    message: 'user deleted',
    data: null,
  });
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }

    const decoded = await promisify(jwt.verify)(
      token,
      JWT_PRIVATEKEY
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    if (currentUser.isPasswordChangedAfter(decoded.iat)) {
      return next();
    }

    res.locals.user = currentUser;
    next();
  } catch (error) {
    next();
  }
};

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshjwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.headers;
  let refreshTk;

  console.log("req.cookies ", req.cookies, refreshToken);
  if (refreshToken && refreshToken.startsWith('Bearer')) {
    refreshTk = refreshToken.split(' ')[1];
  } else if (req.cookies.refreshjwt) {
    refreshTk = req.cookies.refreshjwt;
  }

  if (!refreshTk) {
    return next(new AppError('Token expired!', 401));
  }

  const decoded = await promisify(jwt.verify)(
    refreshTk,
    JWT_PRIVATEKEY
  );

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user does not exist!!Please login again!'));
  }

  if (currentUser.isPasswordChangedAfter(decoded.iat)) {
    return next(new AppError('Token has expired.Please login again!!'));
  }

  await createSendToken(currentUser, 200, req, res, 'login successful', false);
};