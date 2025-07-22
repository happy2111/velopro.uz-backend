module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Только изображения')) {
    return res.status(400).json({ message: err.message });
  }
  next(err); // передать дальше
};
