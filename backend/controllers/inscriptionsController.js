// controllers/inscriptionsController.js
const db = require('../config/db');

exports.getAll = (req, res) => {
  const { annee_id, parcours_id, decision_id } = req.query;
  let sql = `
    SELECT i.*,
           e.nom, e.prenoms,
           c.abreviation   AS civilite,
           aa.libelle      AS annee_libelle,
           d.libelle       AS decision_libelle,
           par.libelle     AS parcours_libelle,
           s.libelle       AS specialite_libelle,
           n.libelle       AS niveau_libelle,
           cy.libelle      AS cycle_libelle,
           p.libelle       AS pays_libelle,
           p.nationalite   AS pays_nationalite    -- ✅ ajout de la nationalité
    FROM inscriptions i
    JOIN etudiants e         ON e.id   = i.etudiants_id
    JOIN civilites c         ON c.id   = e.civilites_id
    JOIN anneeacademiques aa ON aa.id  = i.annee_academique_id
    JOIN decisions d         ON d.id   = i.decisions_id
    JOIN parcours par        ON par.id = i.parcours_id
    JOIN specialites s       ON s.id   = par.specialites_id
    JOIN niveaux n           ON n.id   = par.niveaux_id
    LEFT JOIN cycles cy      ON cy.id  = par.cycles_id
    JOIN pays p              ON p.id   = e.pays_id   -- jointure vers pays
    WHERE i.deleted_at IS NULL
  `;
  const params = [];
  if (annee_id)    { sql += ' AND i.annee_academique_id = ?'; params.push(annee_id); }
  if (parcours_id) { sql += ' AND i.parcours_id = ?';         params.push(parcours_id); }
  if (decision_id) { sql += ' AND i.decisions_id = ?';        params.push(decision_id); }
  sql += ' ORDER BY i.dateInscription DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  db.query(
    `SELECT i.*,
            e.nom, e.prenoms, e.email AS etudiant_email, e.telephone AS etudiant_tel,
            c.abreviation    AS civilite,
            p.libelle        AS pays_libelle,
            p.nationalite    AS pays_nationalite,   -- ✅ ajout de la nationalité
            aa.libelle       AS annee_libelle,
            d.libelle        AS decision_libelle,
            par.libelle      AS parcours_libelle,
            s.libelle        AS specialite_libelle,
            n.libelle        AS niveau_libelle,
            cy.libelle       AS cycle_libelle
     FROM inscriptions i
     JOIN etudiants e         ON e.id   = i.etudiants_id
     JOIN civilites c         ON c.id   = e.civilites_id
     JOIN pays p              ON p.id   = e.pays_id
     JOIN anneeacademiques aa ON aa.id  = i.annee_academique_id
     JOIN decisions d         ON d.id   = i.decisions_id
     JOIN parcours par        ON par.id = i.parcours_id
     JOIN specialites s       ON s.id   = par.specialites_id
     JOIN niveaux n           ON n.id   = par.niveaux_id
     LEFT JOIN cycles cy      ON cy.id  = par.cycles_id
     WHERE i.id = ? AND i.deleted_at IS NULL`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Inscription non trouvée.' });
      res.json(results[0]);
    }
  );
};


exports.create = (req, res) => {
  const { etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription } = req.body;

  if (!etudiants_id || !parcours_id || !annee_academique_id || !decisions_id || !dateInscription) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  // ✅ Vérifier si l'inscription existe déjà (même étudiant, même parcours, même année)
  db.query(
    `SELECT id FROM inscriptions
     WHERE etudiants_id = ? AND annee_academique_id = ? AND parcours_id = ? AND deleted_at IS NULL`,
    [etudiants_id, annee_academique_id, parcours_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });

      if (existing.length > 0) {
        return res.status(409).json({
          message: 'Cet étudiant est déjà inscrit dans ce parcours pour cette année académique.',
        });
      }

      db.query(
        'INSERT INTO inscriptions (etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription) VALUES (?, ?, ?, ?, ?)',
        [etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
          res.status(201).json({ id: result.insertId, message: 'Inscription créée avec succès.' });
        }
      );
    }
  );
};

exports.update = (req, res) => {
  const { etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription } = req.body;

  if (!etudiants_id || !parcours_id || !annee_academique_id || !decisions_id || !dateInscription) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  db.query(
    `UPDATE inscriptions
     SET etudiants_id = ?, parcours_id = ?, annee_academique_id = ?,
         decisions_id = ?, dateInscription = ?, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    [etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Inscription non trouvée.' });
      res.json({ message: 'Inscription mise à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE inscriptions SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Inscription non trouvée.' });
      res.json({ message: 'Inscription supprimée avec succès.' });
    }
  );
};

// ✅ Supprimé getStats (dupliquait statsController) — utiliser /api/stats/dashboard