const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token found');
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed');
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user?.role !== requiredRole) {
      console.log('❌ Insufficient role');
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };