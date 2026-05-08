const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    `SELECT s.*, f.libelle AS filiere_libelle
     FROM specialites s
     JOIN filieres f ON f.id = s.filieres_id
     WHERE s.deleted_at IS NULL
     ORDER BY s.libelle`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    `SELECT s.*, f.libelle AS filiere_libelle
     FROM specialites s
     JOIN filieres f ON f.id = s.filieres_id
     WHERE s.id = ? AND s.deleted_at IS NULL`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Spécialité non trouvée.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, filieres_id, description } = req.body;
  if (!libelle || !filieres_id) return res.status(400).json({ message: 'Libellé et filière sont obligatoires.' });

  db.query(
    'INSERT INTO specialites (libelle, filieres_id, description) VALUES (?, ?, ?)',
    [libelle, filieres_id, description || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette spécialité existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Spécialité créée avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, filieres_id, description } = req.body;
  if (!libelle || !filieres_id) return res.status(400).json({ message: 'Libellé et filière sont obligatoires.' });

  db.query(
    'UPDATE specialites SET libelle = ?, filieres_id = ?, description = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, filieres_id, description || null, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette spécialité existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Spécialité non trouvée.' });
      res.json({ message: 'Spécialité mise à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE specialites SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Spécialité non trouvée.' });
      res.json({ message: 'Spécialité supprimée avec succès.' });
    }
  );
};