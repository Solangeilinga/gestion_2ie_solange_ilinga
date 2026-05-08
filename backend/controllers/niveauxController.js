const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM niveaux WHERE deleted_at IS NULL ORDER BY ordre',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM niveaux WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Niveau non trouvé.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, ordre } = req.body;
  if (!libelle || ordre == null) return res.status(400).json({ message: 'Libellé et ordre sont obligatoires.' });

  db.query(
    'INSERT INTO niveaux (libelle, ordre) VALUES (?, ?)',
    [libelle, ordre],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce niveau existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Niveau créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, ordre } = req.body;
  if (!libelle || ordre == null) return res.status(400).json({ message: 'Libellé et ordre sont obligatoires.' });

  db.query(
    'UPDATE niveaux SET libelle = ?, ordre = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, ordre, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce niveau existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Niveau non trouvé.' });
      res.json({ message: 'Niveau mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE niveaux SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Niveau non trouvé.' });
      res.json({ message: 'Niveau supprimé avec succès.' });
    }
  );
};