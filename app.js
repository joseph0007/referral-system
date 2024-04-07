const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError');
const appErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const referralRouter = require('./routes/referralRoutes');

const app = express();

app.use(cookieParser());

app.use(
  express.json({
    limit: '100mb',
  })
);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/referrals', referralRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server!!`, 404));
});

app.use(appErrorHandler);

module.exports = app;
