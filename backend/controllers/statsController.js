// controllers/statsController.js
const db = require('../config/db');

exports.getDashboard = (req, res) => {
  const queries = {
    // KPI principaux
    kpi: `
      SELECT
        (SELECT COUNT(*) FROM etudiants      WHERE deleted_at IS NULL) AS total_etudiants,
        (SELECT COUNT(*) FROM inscriptions   WHERE deleted_at IS NULL) AS total_inscriptions,
        (SELECT COUNT(*) FROM ecoles         WHERE deleted_at IS NULL) AS total_ecoles,
        (SELECT COUNT(*) FROM filieres       WHERE deleted_at IS NULL) AS total_filieres,
        (SELECT COUNT(*) FROM parcours       WHERE deleted_at IS NULL) AS total_parcours,
        (SELECT COUNT(*) FROM specialites    WHERE deleted_at IS NULL) AS total_specialites,
        (SELECT libelle  FROM anneeacademiques WHERE est_active = 1 AND deleted_at IS NULL LIMIT 1) AS annee_active
    `,
    // Inscriptions par décision (année active)
    par_decision: `
      SELECT d.libelle, COUNT(*) AS count
      FROM inscriptions i
      JOIN decisions d ON d.id = i.decisions_id
      JOIN anneeacademiques aa ON aa.id = i.annee_academique_id
      WHERE i.deleted_at IS NULL AND aa.est_active = 1
      GROUP BY d.id, d.libelle
      ORDER BY count DESC
    `,
    // Inscriptions par filière (année active)
    par_filiere: `
      SELECT f.libelle, COUNT(*) AS count
      FROM inscriptions i
      JOIN parcours par ON par.id = i.parcours_id
      JOIN specialites s ON s.id = par.specialites_id
      JOIN filieres f ON f.id = s.filieres_id
      JOIN anneeacademiques aa ON aa.id = i.annee_academique_id
      WHERE i.deleted_at IS NULL AND aa.est_active = 1
      GROUP BY f.id, f.libelle
      ORDER BY count DESC
      LIMIT 8
    `,
    // Étudiants par pays (top 8)
    par_pays: `
      SELECT p.libelle, COUNT(*) AS count
      FROM etudiants e
      JOIN pays p ON p.id = e.pays_id
      WHERE e.deleted_at IS NULL
      GROUP BY p.id, p.libelle
      ORDER BY count DESC
      LIMIT 8
    `,
    // Inscriptions par année (historique)
    par_annee: `
      SELECT aa.libelle, COUNT(*) AS count
      FROM inscriptions i
      JOIN anneeacademiques aa ON aa.id = i.annee_academique_id
      WHERE i.deleted_at IS NULL
      GROUP BY aa.id, aa.libelle
      ORDER BY aa.date_debut ASC
    `,
    // 10 dernières inscriptions
    recentes: `
      SELECT i.id, i.dateInscription,
             e.nom, e.prenoms,
             c.abreviation,
             d.libelle AS decision_libelle,
             par.libelle AS parcours_libelle,
             aa.libelle AS annee_libelle
      FROM inscriptions i
      JOIN etudiants e ON e.id = i.etudiants_id
      JOIN civilites c ON c.id = e.civilites_id
      JOIN decisions d ON d.id = i.decisions_id
      JOIN parcours par ON par.id = i.parcours_id
      JOIN anneeacademiques aa ON aa.id = i.annee_academique_id
      WHERE i.deleted_at IS NULL
      ORDER BY i.created_at DESC
      LIMIT 10
    `,
  };

  const results = {};
  const keys    = Object.keys(queries);
  let done      = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      }
      results[key] = key === 'kpi' ? rows[0] : rows;
      done++;
      if (done === keys.length) res.json(results);
    });
  });
};