const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login, signup, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const passwordRules = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[^a-zA-Z0-9]/)
  .withMessage('Password must contain at least one special character');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/signup',
  [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be 20-60 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('address')
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters'),
    passwordRules,
  ],
  validate,
  signup
);

router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be 8-16 characters')
      .matches(/[A-Z]/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/)
      .withMessage('New password must contain at least one special character'),
  ],
  validate,
  updatePassword
);

module.exports = router;
