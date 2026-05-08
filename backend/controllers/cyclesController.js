const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM cycles WHERE deleted_at IS NULL ORDER BY libelle',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM cycles WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Cycle non trouvé.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, duree_annees } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'INSERT INTO cycles (libelle, duree_annees) VALUES (?, ?)',
    [libelle, duree_annees || 3],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce cycle existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Cycle créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, duree_annees } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'UPDATE cycles SET libelle = ?, duree_annees = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, duree_annees || 3, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce cycle existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Cycle non trouvé.' });
      res.json({ message: 'Cycle mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE cycles SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Cycle non trouvé.' });
      res.json({ message: 'Cycle supprimé avec succès.' });
    }
  );
};