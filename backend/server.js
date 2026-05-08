require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── Auth (publique) ────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));

// ─── Ressources de référence ────────────────────────
app.use('/api/pays',            require('./routes/pays'));
app.use('/api/civilites',       require('./routes/civilites'));
app.use('/api/cycles',          require('./routes/cycles'));
app.use('/api/decisions',       require('./routes/decisions'));


app.use('/api/stats', require('./routes/stats'))


// ─── Entités principales ────────────────────────────
app.use('/api/ecoles',          require('./routes/ecoles'));
app.use('/api/filieres',        require('./routes/filieres'));
app.use('/api/specialites',     require('./routes/specialites'));
app.use('/api/ecolesfilieres',  require('./routes/ecolesfilieres'));

// ─── Structure académique ───────────────────────────
app.use('/api/niveaux',         require('./routes/niveaux'));
app.use('/api/parcours',        require('./routes/parcours'));
app.use('/api/annees',          require('./routes/annees'));

// ─── Étudiants & inscriptions ───────────────────────
app.use('/api/etudiants',       require('./routes/etudiants'));
app.use('/api/inscriptions',    require('./routes/inscriptions'));

// ─── Gestion globale des erreurs ────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});