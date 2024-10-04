const errorHandler = (err, req, res, next) => {
  // check if response headers have already been sent to the client
  if (res.headersSent) {
    // this prevents the current middleware from trying to send another response
    return next(err);
  }

  const statusCode =
    res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode);

  if (process.env.NODE_ENV !== "production") {
    console.log(err);
  }

  return res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
