//userRoutes.js
const express = require('express');
const { check } = require('express-validator');
const { registerUser, completeRegistration } = require('../controllers/userControllers/userController');
const authMiddleware = require('../middleware/userAuth');
const { verifyEmailOtp, verifyMobileOtp } = require('../controllers/otpVerifyController');
const { loginUser, getAllUsers, getUserById, updateUserById, deleteUserById, logoutUser } = require('../controllers/userControllers/userAuthController');
const { validateUser } = require('../middleware/validateUser');
const router = express.Router();
const jwt = require("jsonwebtoken");
const createRetailerRole = require('../controllers/retailerControllers/createRetailerRoleController');

//signup route
router.post(
  '/users/register',
  validateUser,
  registerUser
);

//verify-mobile route
router.post('/users/verify-mobile', [
  check('mobile', 'Please include a valid mobile number')
    .isMobilePhone() // checks if the mobile number is valid
    .custom((value) => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format validation
      if (!phoneRegex.test(value)) {
        throw new Error('Mobile number must be in E.164 format (e.g., +1234567890)');
      }
      return true;
    }),

  // Validate OTP
  check('otp', 'OTP is required')
    .notEmpty()  // Ensures OTP is not empty
    .isNumeric() // Ensures OTP is numeric
    .isLength({ min: 6, max: 6 }) // Ensures OTP length is exactly 6 digits
    .withMessage('OTP must be exactly 6 digits'),
],
  verifyMobileOtp);


//verify-email route
router.post('/users/verify-email', 
  [
    check('email', 'Please include a valid email').isEmail(),
    // Validate OTP
    check('otp', 'OTP is required')
      .notEmpty()  // Ensures OTP is not empty
      .isNumeric() // Ensures OTP is numeric
      .isLength({ min: 6, max: 6 }) // Ensures OTP length is exactly 6 digits
      .withMessage('OTP must be exactly 6 digits'),
  ],
  verifyEmailOtp
);

//complete-registeration route
router.post('/users/complete-reg', completeRegistration);

//login route  
router.post(
  '/users/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

router.get("/users/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    res.status(200).json({ success: true, user: decoded });
  });
});

router.post('/users/logout',logoutUser);

// Read All Users
router.get('/users/', authMiddleware, getAllUsers);

// Read Single User
router.get('/users/:id', authMiddleware, getUserById);

// Update User
router.put(
  '/users/:id', authMiddleware,
  [
    check('email').optional().isEmail().withMessage('Please include a valid email'),
    check('mobile', 'Please include a valid mobile number')
      .isMobilePhone() // checks if the mobile number is valid
      .custom((value) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format validation
        if (!phoneRegex.test(value)) {
          throw new Error('Mobile number must be in E.164 format (e.g., +1234567890)');
        }
        return true;
      }),
    check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword')
      .optional()
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  updateUserById
);

// Delete User
router.delete('/users/:id', authMiddleware, deleteUserById);

// create-retailer-role
router.put('/users/create-retailer/:id', authMiddleware, createRetailerRole);

module.exports = router;
