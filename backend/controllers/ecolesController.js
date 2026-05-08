const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM ecoles WHERE deleted_at IS NULL ORDER BY libelle',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM ecoles WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'École non trouvée.' });
      res.json(results[0]);
    }
  );
};

// GET filières d'une école
exports.getFilieres = (req, res) => {
  db.query(
    `SELECT f.*, ef.statut, ef.dateOuverture
     FROM filieres f
     JOIN ecolesfilieres ef ON ef.filieres_id = f.id
     WHERE ef.ecoles_id = ? AND f.deleted_at IS NULL
     ORDER BY f.libelle`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, adresse, telephone, email } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'INSERT INTO ecoles (libelle, adresse, telephone, email) VALUES (?, ?, ?, ?)',
    [libelle, adresse || null, telephone || null, email || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Une école avec ce libellé existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'École créée avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, adresse, telephone, email } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'UPDATE ecoles SET libelle = ?, adresse = ?, telephone = ?, email = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, adresse || null, telephone || null, email || null, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Une école avec ce libellé existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'École non trouvée.' });
      res.json({ message: 'École mise à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE ecoles SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'École non trouvée.' });
      res.json({ message: 'École supprimée avec succès.' });
    }
  );
};