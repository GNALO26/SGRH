module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }

  req.company_id = req.user.company_id;
  next();
};