// createRetailerRole.js
const { mailHelper } = require('../../helpers/mailHelper'); // Assuming you have a mailHelper utility
const User = require('../../models/User'); // Your Mongoose User model

// Update retailer role and send email logic
const createRetailerRole = async (req, res) => {
  const { id } = req.params; // Expect user_id in the URL parameters
  const { decision, reason } = req.body; // 'decision' will be 'yes' or 'no'

  try {
    // Find the user by their ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (decision === 'yes') {
      // Update user role to 'retailer'
      user.role = 'retailer'; // Assuming role is a string field
      await user.save();

      // Send success message to the user
      await mailHelper(
        user.email,
        'Congratulations!',
        'You are now a retailer.'
      );

      return res.status(200).json({
        message: 'Role updated to retailer, and notification sent.',
      });
    } else if (decision === 'no') {
      // Send reason to the user
      if (!reason) {
        return res.status(400).json({ message: 'Reason is required' });
      }

      await mailHelper(
        user.email,
        'Role Update Request Rejected',
        `Your request to become a retailer was rejected. Reason: ${reason}`
      );

      return res.status(200).json({
        message: 'No changes made. Reason sent to the user.',
      });
    } else {
      return res.status(400).json({ message: 'Invalid decision option' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = createRetailerRole;

