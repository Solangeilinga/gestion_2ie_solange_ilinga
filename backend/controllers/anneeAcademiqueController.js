const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    'SELECT * FROM anneeacademiques WHERE deleted_at IS NULL ORDER BY date_debut DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    'SELECT * FROM anneeacademiques WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Année académique non trouvée.' });
      res.json(results[0]);
    }
  );
};

exports.getActive = (req, res) => {
  db.query(
    'SELECT * FROM anneeacademiques WHERE est_active = 1 AND deleted_at IS NULL LIMIT 1',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Aucune année active.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, date_debut, date_fin, est_active } = req.body;
  if (!libelle || !date_debut || !date_fin) {
    return res.status(400).json({ message: 'Libellé, date début et date fin sont obligatoires.' });
  }

  const doInsert = () => {
    db.query(
      'INSERT INTO anneeacademiques (libelle, date_debut, date_fin, est_active) VALUES (?, ?, ?, ?)',
      [libelle, date_debut, date_fin, est_active ? 1 : 0],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette année académique existe déjà.' });
          return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
        }
        res.status(201).json({ id: result.insertId, message: 'Année académique créée avec succès.' });
      }
    );
  };

  if (est_active) {
    // Désactiver toutes les autres avant d'insérer
    db.query('UPDATE anneeacademiques SET est_active = 0 WHERE deleted_at IS NULL', (err) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      doInsert();
    });
  } else {
    doInsert();
  }
};

exports.update = (req, res) => {
  const { libelle, date_debut, date_fin, est_active } = req.body;
  if (!libelle || !date_debut || !date_fin) {
    return res.status(400).json({ message: 'Libellé, date début et date fin sont obligatoires.' });
  }

  const doUpdate = () => {
    db.query(
      'UPDATE anneeacademiques SET libelle = ?, date_debut = ?, date_fin = ?, est_active = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [libelle, date_debut, date_fin, est_active ? 1 : 0, req.params.id],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cette année académique existe déjà.' });
          return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
        }
        if (!result.affectedRows) return res.status(404).json({ message: 'Année académique non trouvée.' });
        res.json({ message: 'Année académique mise à jour avec succès.' });
      }
    );
  };

  if (est_active) {
    db.query(
      'UPDATE anneeacademiques SET est_active = 0 WHERE id != ? AND deleted_at IS NULL',
      [req.params.id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
        doUpdate();
      }
    );
  } else {
    doUpdate();
  }
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE anneeacademiques SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Année académique non trouvée.' });
      res.json({ message: 'Année académique supprimée avec succès.' });
    }
  );
};