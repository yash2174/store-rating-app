const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores,
} = require('../controllers/adminController');

const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getDashboardStats);

router.post(
  '/users',
  [
    body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be 8-16 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/)
      .withMessage('Password must contain at least one special character'),
    body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),
    body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
  ],
  validate,
  createUser
);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);

router.post(
  '/stores',
  [
    body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),
  ],
  validate,
  createStore
);

router.get('/stores', getStores);

module.exports = router;
