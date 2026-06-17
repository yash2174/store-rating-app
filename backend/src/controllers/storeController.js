const pool = require('../config/db');

async function getStores(req, res) {
  const { name, address, sortBy = 'name', order = 'asc' } = req.query;
  const userId = req.user.id;

  const allowedSortFields = ['name', 'address', 'avg_rating'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const params = [userId];
  let paramIndex = 2;

  if (name) {
    conditions.push(`s.name ILIKE $${paramIndex++}`);
    params.push(`%${name}%`);
  }
  if (address) {
    conditions.push(`s.address ILIKE $${paramIndex++}`);
    params.push(`%${address}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.address,
         s.email,
         ROUND(AVG(r.rating), 2) AS avg_rating,
         COUNT(r.id) AS total_ratings,
         ur.rating AS user_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
       ${whereClause}
       GROUP BY s.id, ur.rating
       ORDER BY ${sortField === 'avg_rating' ? 'avg_rating' : `s.${sortField}`} ${sortOrder} NULLS LAST`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function submitRating(req, res) {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = $3, updated_at = NOW()
       RETURNING *`,
      [userId, storeId, rating]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getStores, submitRating };
