const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const { validationResult } = require('express-validator');
const { mailHelper } = require('../../helpers/mailHelper');
require('dotenv').config();

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register User
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract fields from the request body
  const {
    name,
    email,
    mobile,
    role,
    password,
    confirmPassword,
    companyName,
    registerationNumber,
    ownerName,
    bankAccountNumber,
    panNumber,
    companyRegAddress,
  } = req.body;

  // Required fields validation
  if (!name || !email || !mobile || !role || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
    // Check if email or mobile already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or mobile already in use' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Send OTP via Twilio for mobile verification
    const otpResponse = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: `+${mobile}`,
        channel: 'sms',
      });

    if (otpResponse.status !== 'pending') {
      return res.status(500).json({ message: 'Failed to send OTP for mobile verification' });
    }

    // Generate and send OTP for email verification
    const emailOtp = generateOtp();
    await mailHelper(email, 'Email Verification OTP', `Your OTP for email verification is: ${emailOtp}`);

    // Store user data temporarily in session
    req.session.userData = {
      name,
      email,
      mobile,
      role,
      password, // Already hashed
      companyName,
      registerationNumber,
      ownerName,
      bankAccountNumber,
      panNumber,
      companyRegAddress,
      emailOtp,
      emailVerified: false, // Initial flag
      mobileVerified: false, // Initial flag
    };

    res.status(201).json({
      message: 'OTP sent to your mobile number and email. Please verify to complete registration.',
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save to database
// Save to database
exports.completeRegistration = async (req, res) => {
  const userData = req.session.userData;

  if (!userData) {
    return res.status(400).json({ message: 'No registration data found. Please register again.' });
  }

  if (!userData.emailVerified || !userData.mobileVerified) {
    return res.status(400).json({ message: 'Verify both email and mobile to complete registration.' });
  }

  try {
    // Create a new user object
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      company: {
        companyName: userData.companyName || null,
        registerationNumber: userData.registerationNumber || null,
        ownerName: userData.ownerName || null,
        bankAccountNumber: userData.bankAccountNumber || null,
        panNumber: userData.panNumber || null,
        companyRegAddress: userData.companyRegAddress || null,
      },
      role: userData.role,
      password: userData.password, // Already hashed
    });

    // Save the user
    await newUser.save();

    // Clear session data
    req.session.userData = null;

    // Format user data for response
    const responseUser = {
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
      company: newUser.company, // Ensure you return the full company data
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    // Return the full response
    res.status(201).json({
      message: 'User registered successfully.',
      user: responseUser,
    });
  } catch (error) {
    console.error('Error saving user to database:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
