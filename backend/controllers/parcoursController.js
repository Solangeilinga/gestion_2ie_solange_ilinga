const db = require('../config/db');

exports.getAll = (req, res) => {
  db.query(
    `SELECT p.*,
            s.libelle AS specialite_libelle,
            n.libelle AS niveau_libelle,
            c.libelle AS cycle_libelle
     FROM parcours p
     JOIN specialites s ON s.id = p.specialites_id
     JOIN niveaux n     ON n.id = p.niveaux_id
     LEFT JOIN cycles c ON c.id = p.cycles_id
     WHERE p.deleted_at IS NULL
     ORDER BY p.libelle`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.getOne = (req, res) => {
  db.query(
    `SELECT p.*,
            s.libelle AS specialite_libelle,
            n.libelle AS niveau_libelle,
            c.libelle AS cycle_libelle
     FROM parcours p
     JOIN specialites s ON s.id = p.specialites_id
     JOIN niveaux n     ON n.id = p.niveaux_id
     LEFT JOIN cycles c ON c.id = p.cycles_id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Parcours non trouvé.' });
      res.json(results[0]);
    }
  );
};

exports.create = (req, res) => {
  const { libelle, specialites_id, niveaux_id, cycles_id } = req.body;
  if (!libelle || !specialites_id || !niveaux_id) {
    return res.status(400).json({ message: 'Libellé, spécialité et niveau sont obligatoires.' });
  }

  db.query(
    'INSERT INTO parcours (libelle, specialites_id, niveaux_id, cycles_id) VALUES (?, ?, ?, ?)',
    [libelle, specialites_id, niveaux_id, cycles_id || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce parcours existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      res.status(201).json({ id: result.insertId, message: 'Parcours créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { libelle, specialites_id, niveaux_id, cycles_id } = req.body;
  if (!libelle || !specialites_id || !niveaux_id) {
    return res.status(400).json({ message: 'Libellé, spécialité et niveau sont obligatoires.' });
  }

  db.query(
    'UPDATE parcours SET libelle = ?, specialites_id = ?, niveaux_id = ?, cycles_id = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [libelle, specialites_id, niveaux_id, cycles_id || null, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ce parcours existe déjà.' });
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      if (!result.affectedRows) return res.status(404).json({ message: 'Parcours non trouvé.' });
      res.json({ message: 'Parcours mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE parcours SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Parcours non trouvé.' });
      res.json({ message: 'Parcours supprimé avec succès.' });
    }
  );
};