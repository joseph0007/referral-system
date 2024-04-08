const sendErrorDev = (err, req, res, isDev) => {

  if( isDev ) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      statusCode: err.statusCode,
      err,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    statusCode: err.statusCode
  });
};

module.exports = (err, req, res, next) => {
  console.log("err ", err);

  if( err.message === "jwt malformed" ) {
    err.statusCode = 401;  
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  err.message = err.message || 'Something went wrong!!';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res, true);
    return;
  }

  sendErrorDev(err, req, res, false);
};
