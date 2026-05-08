const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM decisions WHERE deleted_at IS NULL ORDER BY libelle',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM decisions WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Décision non trouvée.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, description } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'INSERT INTO decisions (libelle, description) VALUES (?, ?)',
    [libelle, description || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette décision existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Décision créée avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, description } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'UPDATE decisions SET libelle = ?, description = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, description || null, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette décision existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Décision non trouvée.' });
      res.json({ message: 'Décision mise à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE decisions SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Décision non trouvée.' });
      res.json({ message: 'Décision supprimée avec succès.' });
    }
  );
};