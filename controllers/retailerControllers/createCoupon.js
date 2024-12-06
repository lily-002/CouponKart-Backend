// controllers/retailerControllers/createCoupon.js
const { validationResult} = require('express-validator');
const Coupon = require('../../models/Coupon');
const User = require('../../models/User');
require('dotenv').config();

exports.createCoupon = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        couponName, validity, validatePerson, couponType, amountTobePay, couponCode, couponStatus, couponCategory
    } = req.body;

    // Check if all required fields are provided
    if (!couponName || !validity || !validatePerson || !couponType || !amountTobePay || !couponCode || !couponStatus ||!couponCategory) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const userId = req.user; // Get retailer ID from the authenticated user

        // Check if the retailer exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Retailer not found' });
        }

        // Create a new Coupon instance
        const coupon = new Coupon({
            couponName,
            couponCode,
            couponType,
            couponCategory,
            amountTobePay,
            validity,
            validatePerson,
            retailerId,
            couponStatus
        });

        // Save the coupon to the database
        await coupon.save();

        // Return the created coupon data in the response
        res.status(200).json({
            message: 'Coupon created successfully.',
            coupon: coupon
        });
    } catch (error) {
        console.error('Error saving coupon:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        // Fetch all coupons from the Coupon table
        const coupons = await Coupon.find(); // You can add fields to exclude or populate if needed

        // Check if coupons are found
        if (!coupons || coupons.length === 0) {
            return res.status(404).json({ message: 'No coupons found' });
        }

        res.status(200).json(coupons); // Return coupons in the response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
    const couponId = req.params.id;

    try {
        const coupon = await Coupon.findById(couponId); // Find coupon by ID
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        res.status(200).json(coupon); // Return coupon data
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update coupon by ID
exports.updateCouponById = async (req, res) => {
    const couponId = req.params.id;
    const { couponName, validity, validatePerson, couponType, amountTobePay, couponCode, couponStatus, couponCategory } = req.body;

    try {
        // Find the coupon by ID
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Check if the couponCode is being updated and already in use
        if (couponCode && couponCode !== coupon.couponCode) {
            const existingCoupon = await Coupon.findOne({ couponCode });
            if (existingCoupon) {
                return res.status(400).json({ message: "Coupon code is already in use" });
            }
            coupon.couponCode = couponCode;
        }

        // Update other fields if provided
        coupon.couponName = couponName || coupon.couponName;
        coupon.couponStatus = couponStatus || coupon.couponStatus;
        coupon.amountTobePay = amountTobePay || coupon.amountTobePay;
        coupon.validatePerson = validatePerson || coupon.validatePerson;
        coupon.validity = validity || coupon.validity;
        coupon.couponType = couponType || coupon.couponType;
        coupon.couponCategory = couponCategory || coupon.couponCategory;

        // Save the updated coupon
        await coupon.save();
        res.status(200).json({ message: "Coupon updated successfully", coupon });
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete user by ID
exports.deleteCouponById = async (req, res) => {
    const couponId = req.params.id;

    try {
        const coupon = await Coupon.findByIdAndDelete(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

//get expired coupon
exports.getExpiredCoupons = async (req, res) => {
    try {
        const today = new Date();

        // Find coupons where validity date is in the past
        const expiredCoupons = await Coupon.find({
            validity: { $lt: today }, // Expired coupons
        });

        if (expiredCoupons.length === 0) {
            return res.status(404).json({ message: 'No expired coupons found' });
        }

        return res.status(200).json({ message: 'Expired coupons retrieved', coupons: expiredCoupons });
    } catch (error) {
        console.error('Error fetching expired coupons:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

