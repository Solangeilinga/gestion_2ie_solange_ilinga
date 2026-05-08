const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    `SELECT ef.*, e.libelle AS ecole_libelle, f.libelle AS filiere_libelle
     FROM ecolesfilieres ef
     JOIN ecoles e   ON e.id = ef.ecoles_id
     JOIN filieres f ON f.id = ef.filieres_id
     WHERE e.deleted_at IS NULL AND f.deleted_at IS NULL
     ORDER BY e.libelle, f.libelle`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.create = (req, res) => {
  const { ecoles_id, filieres_id, statut, dateOuverture } = req.body;
  if (!ecoles_id || !filieres_id) return res.status(400).json({ message: 'École et filière sont obligatoires.' });

  db.query(
    'INSERT INTO ecolesfilieres (ecoles_id, filieres_id, statut, dateOuverture) VALUES (?, ?, ?, ?)',
    [ecoles_id, filieres_id, statut || 'actif', dateOuverture || null],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette filière est déjà liée à cette école.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ message: 'Lien école-filière créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { statut, dateOuverture } = req.body;
  const { ecoles_id, filieres_id } = req.params;

  db.query(
    'UPDATE ecolesfilieres SET statut = ?, dateOuverture = ? WHERE ecoles_id = ? AND filieres_id = ?',
    [statut || 'actif', dateOuverture || null, ecoles_id, filieres_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Lien non trouvé.' });
      res.json({ message: 'Lien mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  const { ecoles_id, filieres_id } = req.params;

  db.query(
    'DELETE FROM ecolesfilieres WHERE ecoles_id = ? AND filieres_id = ?',
    [ecoles_id, filieres_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Lien non trouvé.' });
      res.json({ message: 'Lien supprimé avec succès.' });
    }
  );
};