// otpVerification.js

const Twilio = require('twilio');
const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Verify Email OTP - Ensure correct flag setting
exports.verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const userData = req.session.userData;
        if (!userData || userData.email !== email) {
            return res.status(400).json({ message: 'Invalid email or session expired' });
        }

        if (userData.emailOtp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark the email as verified
        req.session.userData.emailVerified = true;
        console.log('Email Verified:', req.session.userData.emailVerified); // Log to verify flag

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify Mobile OTP - Ensure correct flag setting
exports.verifyMobileOtp = async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    try {
        if (!req.session.userData) {
            return res.status(400).json({ message: 'Session expired or user data missing. Please start registration process again.' });
        }

        // Check OTP via Twilio
        const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks.create({
                to: `+${mobile}`,
                code: otp,
            });

        if (verificationCheck.status !== 'approved') {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark the mobile as verified
        req.session.userData.mobileVerified = true;
        console.log('Mobile Verified:', req.session.userData.mobileVerified); // Log to verify flag

        res.status(200).json({ message: 'Mobile verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};