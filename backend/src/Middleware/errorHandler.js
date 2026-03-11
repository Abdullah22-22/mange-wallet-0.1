export function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode =
    err.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}