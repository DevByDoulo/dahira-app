const { search } = require('./search.service');

const searchController = async (req, res) => {
  const q = (req.query.q ?? '').trim();
  if (q.length < 2) return res.json({ success: true, data: [] });

  try {
    console.log('[Search] dahira_id:', req.dahira_id, '| q:', q);
    const results = await search(req.dahira_id, q);
    console.log('[Search] résultats:', results.length);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('[Search] erreur:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { searchController };
