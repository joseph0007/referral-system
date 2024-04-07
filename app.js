const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const compression = require('compression');

const AppError = require('./utils/appError');
const appErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const referralRouter = require('./routes/referralRoutes');

const app = express();

app.use(compression());

if( process.env.ENFORCE_HTTPS === true ) {
  app.use(cors());
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

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

app.all('/api/v1/*', (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server!!`, 404));
});

app.use(express.static(`${__dirname}/client/build`));

app.get("*", (req, res) => {
  res.sendFile(`${__dirname}/client/build/index.html`)
});

app.use(appErrorHandler);

module.exports = app;
