// middleware/auth.js
module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
  }
  next();
};
