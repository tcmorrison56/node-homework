function errorHandler(err, req, res, next) {
  if (err.code === "ECONNREFUSED" && err.port === 5432) {
    console.log(
      "The database connection was refused. Is your database service running?",
    );
  }

  console.error(err);
  const status = err.status || 500;
  const message =
    status >= 400 && status < 500
      ? { message: err.message }
      : { message: "Internal Server Error" };
  res.status(status).json(message);
}

module.exports = errorHandler;
