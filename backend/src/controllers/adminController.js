const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createUser(req, res) {
  const { name, email, password, address, role } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashed, address, role || 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getUsers(req, res) {
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;

  const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (name) {
    conditions.push(`u.name ILIKE $${paramIndex++}`);
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push(`u.email ILIKE $${paramIndex++}`);
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push(`u.address ILIKE $${paramIndex++}`);
    params.push(`%${address}%`);
  }
  if (role) {
    conditions.push(`u.role = $${paramIndex++}`);
    params.push(role);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              ROUND(AVG(r.rating), 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.${sortField} ${sortOrder}`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              ROUND(AVG(r.rating), 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createStore(req, res) {
  const { name, email, address, owner_id } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Store with this email already exists' });
    }

    if (owner_id) {
      const ownerCheck = await pool.query(
        'SELECT id, role FROM users WHERE id = $1',
        [owner_id]
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Owner user not found' });
      }
      // Update user role to store_owner if not already
      await pool.query(
        `UPDATE users SET role = 'store_owner', updated_at = NOW() WHERE id = $1 AND role = 'user'`,
        [owner_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, owner_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getStores(req, res) {
  const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;

  const allowedSortFields = ['name', 'email', 'address'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (name) {
    conditions.push(`s.name ILIKE $${paramIndex++}`);
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push(`s.email ILIKE $${paramIndex++}`);
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push(`s.address ILIKE $${paramIndex++}`);
    params.push(`%${address}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
              ROUND(AVG(r.rating), 2) AS avg_rating,
              COUNT(r.id) AS total_ratings,
              u.name AS owner_name
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN users u ON u.id = s.owner_id
       ${whereClause}
       GROUP BY s.id, u.name
       ORDER BY s.${sortField} ${sortOrder}`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores,
};
