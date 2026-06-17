const pool = require('../config/db');

async function getMyStoreDashboard(req, res) {
  const ownerId = req.user.id;

  try {
    // Get store owned by this user
    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: 'No store found for your account' });
    }

    const store = storeResult.rows[0];

    // Get average rating
    const avgResult = await pool.query(
      `SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total_ratings
       FROM ratings WHERE store_id = $1`,
      [store.id]
    );

    // Get list of users who submitted ratings
    const ratingsResult = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store: {
        ...store,
        avg_rating: avgResult.rows[0].avg_rating,
        total_ratings: parseInt(avgResult.rows[0].total_ratings),
      },
      raters: ratingsResult.rows,
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMyStoreDashboard };
