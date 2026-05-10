// config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'gestion_ecoles',
  waitForConnections: true,
  connectionLimit:  10,
});

// ✅ Vérification de connexion au démarrage
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connexion échouée :', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL connecté avec succès');
  connection.release();
});

module.exports = pool;