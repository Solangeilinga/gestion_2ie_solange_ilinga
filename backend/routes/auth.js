// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require('../config/db');
const jwt = require("jsonwebtoken");       // npm install jsonwebtoken
const bcrypt = require("bcrypt");          // npm install bcrypt (recommandé)

// ⚠️ À placer dans un fichier .env plus tard
const JWT_SECRET = "votre_secret_tres_long_et_aleatoire";

// ==================== ROUTE LOGIN ====================
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // 1. Validation des champs
    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // 2. Requête SQL
    const sql = "SELECT * FROM utilisateurs WHERE email = ?";
    
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Erreur DB:", err);
            return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
        }

        // 3. Vérification existence utilisateur
        if (results.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 5. Génération du token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // 6. Réponse conforme au frontend
        res.json({
            message: "Connexion réussie",
            token: token,
            utilisateur: {
                id: user.id,
                nom: user.nom,
                email: user.email
            }
        });
    });
});

// ==================== ROUTE ME (protégée) ====================
const verifyToken = require("../middleware/verifyToken");

router.get("/me", verifyToken, (req, res) => {
    db.query(
        "SELECT id, nom, email FROM utilisateurs WHERE id = ?",
        [req.utilisateur.id],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ message: "Utilisateur introuvable." });
            }
            res.json(results[0]);
        }
    );
});

module.exports = router;