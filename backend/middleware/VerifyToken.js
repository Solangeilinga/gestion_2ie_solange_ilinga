// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

// ✅ JWT_SECRET depuis les variables d'environnement uniquement
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Token manquant.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalide ou expiré.' });
    req.utilisateur = decoded;
    next();
  });
};