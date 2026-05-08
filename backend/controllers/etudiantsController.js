const db = require('../config/db');

exports.getAll = (req, res) => {
  const { search, pays_id } = req.query;
  let sql = `
    SELECT e.*, p.libelle AS pays_libelle, c.libelle AS civilite_libelle, c.abreviation
    FROM etudiants e
    JOIN pays p      ON p.id = e.pays_id
    JOIN civilites c ON c.id = e.civilites_id
    WHERE e.deleted_at IS NULL
  `;
  const params = [];
  if (search) {
    sql += ' AND (e.nom LIKE ? OR e.prenoms LIKE ? OR e.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (pays_id) { sql += ' AND e.pays_id = ?'; params.push(pays_id); }
  sql += ' ORDER BY e.nom, e.prenoms';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  db.query(
    `SELECT e.*, p.libelle AS pays_libelle, c.libelle AS civilite_libelle, c.abreviation
     FROM etudiants e
     JOIN pays p      ON p.id = e.pays_id
     JOIN civilites c ON c.id = e.civilites_id
     WHERE e.id = ? AND e.deleted_at IS NULL`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!results.length) return res.status(404).json({ message: 'Étudiant non trouvé.' });
      res.json(results[0]);
    }
  );
};

exports.getInscriptions = (req, res) => {
  db.query(
    `SELECT i.*,
            aa.libelle  AS annee_libelle,
            d.libelle   AS decision_libelle,
            par.libelle AS parcours_libelle,
            s.libelle   AS specialite_libelle,
            n.libelle   AS niveau_libelle,
            cy.libelle  AS cycle_libelle
     FROM inscriptions i
     JOIN anneeacademiques aa ON aa.id = i.annee_academique_id
     JOIN decisions d         ON d.id  = i.decisions_id
     JOIN parcours par        ON par.id = i.parcours_id
     JOIN specialites s       ON s.id  = par.specialites_id
     JOIN niveaux n           ON n.id  = par.niveaux_id
     LEFT JOIN cycles cy      ON cy.id = par.cycles_id
     WHERE i.etudiants_id = ? AND i.deleted_at IS NULL
     ORDER BY aa.date_debut DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.json(results);
    }
  );
};

exports.create = (req, res) => {
  const { nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone, photo } = req.body;
  if (!nom || !prenoms || !pays_id || !civilites_id) {
    return res.status(400).json({ message: 'Nom, prénoms, pays et civilité sont obligatoires.' });
  }
  db.query(
    `INSERT INTO etudiants (nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nom, prenoms, pays_id, civilites_id, dateNaissance || null, email || null, telephone || null, photo || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      res.status(201).json({ id: result.insertId, message: 'Étudiant créé avec succès.' });
    }
  );
};

exports.update = (req, res) => {
  const { nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone, photo } = req.body;
  if (!nom || !prenoms || !pays_id || !civilites_id) {
    return res.status(400).json({ message: 'Nom, prénoms, pays et civilité sont obligatoires.' });
  }
  db.query(
    `UPDATE etudiants
     SET nom = ?, prenoms = ?, pays_id = ?, civilites_id = ?,
         dateNaissance = ?, email = ?, telephone = ?, photo = ?, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    [nom, prenoms, pays_id, civilites_id, dateNaissance || null, email || null, telephone || null,
     photo !== undefined ? photo : null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Étudiant non trouvé.' });
      res.json({ message: 'Étudiant mis à jour avec succès.' });
    }
  );
};

exports.remove = (req, res) => {
  db.query(
    'UPDATE etudiants SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
      if (!result.affectedRows) return res.status(404).json({ message: 'Étudiant non trouvé.' });
      res.json({ message: 'Étudiant supprimé avec succès.' });
    }
  );
};