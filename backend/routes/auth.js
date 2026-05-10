// routes/auth.js
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');

// ✅ JWT_SECRET depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant dans .env');
  process.exit(1);
}

// ==================== LOGIN ====================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: { id: user.id, nom: user.nom, email: user.email },
    });
  });
});

// ==================== ME (protégée) ====================
const verifyToken = require('../middleware/verifyToken');

router.get('/me', verifyToken, (req, res) => {
  db.query(
    'SELECT id, nom, email FROM utilisateurs WHERE id = ?',
    [req.utilisateur.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
      res.json(results[0]);
    }
  );
});

module.exports = router;