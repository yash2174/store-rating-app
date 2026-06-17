require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function reset() {
  const hashed = await bcrypt.hash('Admin@123', 10);
  await pool.query(
    'UPDATE users SET password = $1 WHERE email = $2',
    [hashed, 'admin@storerating.com']
  );
  console.log('Admin password reset successfully');
  process.exit();
}

reset();