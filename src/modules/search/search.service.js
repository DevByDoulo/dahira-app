const pool = require('../../config/db');

const search = async (dahiraId, q) => {
  const fullLike = `%${q}%`;
  const words = q.trim().split(/\s+/).filter(Boolean);

  // Chaque mot doit apparaître dans nom OU prenom OU telephone
  const wordClauses = words.map(() =>
    `(nom LIKE ? OR IFNULL(prenom, '') LIKE ? OR telephone LIKE ?)`,
  ).join(' AND ');
  const wordParams = words.flatMap((w) => [`%${w}%`, `%${w}%`, `%${w}%`]);

  const [membres] = await pool.query(
    `SELECT id, nom, prenom, telephone, photo_url, thumbnail_url
     FROM membres
     WHERE dahira_id = ?
       AND (CONCAT_WS(' ', prenom, nom) LIKE ? OR ${wordClauses})
     LIMIT 4`,
    [dahiraId, fullLike, ...wordParams],
  );

  const [seances] = await pool.query(
    `SELECT id, type, date_seance, lieu, theme
     FROM seances
     WHERE dahira_id = ?
       AND (theme LIKE ? OR lieu LIKE ? OR type LIKE ?)
     ORDER BY date_seance DESC
     LIMIT 3`,
    [dahiraId, fullLike, fullLike, fullLike],
  );

  const [annonces] = await pool.query(
    `SELECT id, titre, created_at
     FROM annonces
     WHERE dahira_id = ?
       AND (titre LIKE ? OR contenu LIKE ?)
     ORDER BY created_at DESC
     LIMIT 3`,
    [dahiraId, fullLike, fullLike],
  );

  const results = [
    ...membres.map((m) => ({
      type: 'membre',
      id: m.id,
      label: `${m.prenom ?? ''} ${m.nom}`.trim(),
      sublabel: m.telephone ?? '',
      photo_url: m.thumbnail_url ?? m.photo_url ?? null,
      route: `/membres/${m.id}`,
    })),
    ...seances.map((s) => ({
      type: 'seance',
      id: s.id,
      label: s.theme ?? s.type ?? 'Séance',
      sublabel: new Date(s.date_seance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      route: `/seances/${s.id}`,
    })),
    ...annonces.map((a) => ({
      type: 'annonce',
      id: a.id,
      label: a.titre,
      sublabel: new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
      route: `/annonces/${a.id}`,
    })),
  ];

  return results;
};

module.exports = { search };
