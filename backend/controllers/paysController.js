const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM pays WHERE deleted_at IS NULL ORDER BY libelle',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM pays WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Pays non trouvé.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, code, nationalite, iso } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'INSERT INTO pays (libelle, code, nationalite, iso) VALUES (?, ?, ?, ?)',
    [libelle, code || null, nationalite || null, iso || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce pays existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Pays créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, code, nationalite, iso } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est obligatoire.' });

  db.query(
    'UPDATE pays SET libelle = ?, code = ?, nationalite = ?, iso = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, code || null, nationalite || null, iso || null, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce pays existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Pays non trouvé.' });
      res.json({ message: 'Pays mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE pays SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Pays non trouvé.' });
      res.json({ message: 'Pays supprimé avec succès.' });
    }
  );
};