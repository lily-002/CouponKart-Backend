// otpHelper.js
const otpGenerator = require('otp-generator');

// Function to generate OTP
const generateOtp = () => {
  return otpGenerator.generate(6, { upperCase: false, specialChars: false });  // Generate 6-digit OTP
};

module.exports = generateOtp;
