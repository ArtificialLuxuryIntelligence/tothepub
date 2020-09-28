const errorHandler = (req, res, next) => {
  const err = new Error(`not found ${req.originalUrl}`);
  res.status(404);
  next(err);
};

module.exports = errorHandler;
