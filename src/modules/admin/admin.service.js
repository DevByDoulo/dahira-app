const pool = require('../../config/db');

const getStats = async () => {
  const [[dahiraStats]] = await pool.query(`
    SELECT
      COUNT(*)                              AS total_dahiras,
      SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) AS dahiras_actifs,
      SUM(CASE WHEN actif = 0 THEN 1 ELSE 0 END) AS dahiras_inactifs
    FROM dahiras
  `);

  const [[userStats]] = await pool.query(`
    SELECT COUNT(*) AS total_users
    FROM membres
    WHERE role != 'super_admin' AND password_hash IS NOT NULL
  `);

  return {
    total_dahiras:    Number(dahiraStats.total_dahiras),
    dahiras_actifs:   Number(dahiraStats.dahiras_actifs   ?? 0),
    dahiras_inactifs: Number(dahiraStats.dahiras_inactifs ?? 0),
    total_users:      Number(userStats.total_users),
  };
};

const getAllDahiras = async () => {
  const [rows] = await pool.query(`
    SELECT
      d.id,
      d.nom,
      COALESCE(d.email, '')     AS email,
      COALESCE(d.telephone, '') AS telephone,
      COALESCE(d.adresse, '')   AS adresse,
      IFNULL(d.actif, 1)        AS actif,
      d.created_at,
      COUNT(DISTINCT m.id) AS total_membres,
      COUNT(DISTINCT u.id) AS total_users
    FROM dahiras d
    LEFT JOIN membres m ON m.dahira_id = d.id AND m.actif = 1
    LEFT JOIN membres u ON u.dahira_id = d.id AND u.role != 'super_admin' AND u.password_hash IS NOT NULL
    GROUP BY d.id, d.nom, d.email, d.telephone, d.adresse, d.actif, d.created_at
    ORDER BY d.created_at DESC
  `);

  return rows.map(r => ({
    ...r,
    actif:         Boolean(r.actif),
    total_membres: Number(r.total_membres),
    total_users:   Number(r.total_users),
  }));
};

const getDahiraById = async (id) => {
  const [[dahira]] = await pool.query(`
    SELECT
      d.id,
      d.nom,
      COALESCE(d.email, '')       AS email,
      COALESCE(d.telephone, '')   AS telephone,
      COALESCE(d.adresse, '')     AS adresse,
      COALESCE(d.description, '') AS description,
      IFNULL(d.actif, 1)          AS actif,
      d.created_at,
      COUNT(DISTINCT m.id) AS total_membres,
      COUNT(DISTINCT u.id) AS total_users
    FROM dahiras d
    LEFT JOIN membres m ON m.dahira_id = d.id
    LEFT JOIN membres u ON u.dahira_id = d.id AND u.role != 'super_admin' AND u.password_hash IS NOT NULL
    WHERE d.id = ?
    GROUP BY d.id, d.nom, d.email, d.telephone, d.adresse, d.description, d.actif, d.created_at
  `, [id]);

  if (!dahira) throw new Error('Dahira introuvable');
  return {
    ...dahira,
    actif:         Boolean(dahira.actif),
    total_membres: Number(dahira.total_membres),
    total_users:   Number(dahira.total_users),
  };
};

const toggleDahiraStatus = async (id) => {
  const [[dahira]] = await pool.query(
    'SELECT id, IFNULL(actif, 1) AS actif FROM dahiras WHERE id = ?',
    [id]
  );
  if (!dahira) throw new Error('Dahira introuvable');

  const newStatus = !dahira.actif;
  await pool.query('UPDATE dahiras SET actif = ? WHERE id = ?', [newStatus ? 1 : 0, id]);
  return { actif: newStatus };
};

module.exports = { getStats, getAllDahiras, getDahiraById, toggleDahiraStatus };
