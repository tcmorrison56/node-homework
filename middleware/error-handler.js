function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message =
    status >= 400 && status < 500
      ? { message: err.message }
      : { message: "Internal Server Error" };
  res.status(status).json(message);
}

module.exports = errorHandler;
