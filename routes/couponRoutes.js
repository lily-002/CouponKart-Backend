//couponRoutes.js
const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
const Coupon = require('../models/Coupon');
const { createCoupon, getAllCoupons, getCouponById, updateCouponById, deleteCouponById, getExpiredCoupons } = require('../controllers/retailerControllers/createCoupon');
const userAuth = require('../middleware/userAuth');

// Create Coupon
router.post('/coupon/create', userAuth,[
    check('couponName', 'Coupon name is required').not().isEmpty(),
    check('couponCategory', 'Coupon Category name is required').not().isEmpty(),
    check('validity', 'Validity must be a valid date').isDate(),
    check('validatePerson', 'ValidatePerson must be a positive integer').isInt({ min: 1 }),
    check('couponType', 'Coupon type is required.Enter the coupon type(Paid/Unpaid)').not().isEmpty(),
    check('amountTobePay', 'Amount to be paid must be a positive number').isFloat({ min: 0 }),
    check('couponCode', 'Coupon code is required').not().isEmpty()
    .custom(async (value) => {
        try {
            const existingCoupon = await Coupon.findOne({ couponCode: value });
            if (existingCoupon) {
                throw new Error('Coupon code must be unique');
            }
            return true;
        } catch (error) {
            console.error('Database error during coupon code validation:', error);
            throw new Error('Internal server error during validation');
        }
    }),
    check('couponStatus', 'Coupon status is required.Enter the coupon status(Active/Inactive)').not().isEmpty(),
  ],
  createCoupon
);

// Get Coupon
router.get('/coupons/', userAuth, getAllCoupons);

// Get Coupon by id
router.get('/coupon/:id', userAuth, getCouponById);

// Update Coupon by id
router.put('/coupon/:id', userAuth, [
    check('couponName', 'Coupon name is required').not().isEmpty(),
    check('couponCategory', 'Coupon Category name is required').not().isEmpty(),
    check('validity', 'Validity must be a valid date').isDate(),
    check('validatePerson', 'ValidatePerson must be a positive integer').isInt({ min: 1 }),
    check('couponType', 'Coupon type is required.Enter the coupon type(Paid/Unpaid)').not().isEmpty(),
    check('amountTobePay', 'Amount to be paid must be a positive number').isFloat({ min: 0 }),
    check('couponCode', 'Coupon code is required').not().isEmpty()
    .custom(async (value) => {
        try {
            const existingCoupon = await Coupon.findOne({ couponCode: value });
            if (existingCoupon) {
                throw new Error('Coupon code must be unique');
            }
            return true;
        } catch (error) {
            console.error('Database error during coupon code validation:', error);
            throw new Error('Internal server error during validation');
        }
    }),
    check('couponStatus', 'Coupon status is required.Enter the coupon status(Active/Inactive)').not().isEmpty(),
  ],
  updateCouponById
);

// Delete Coupon by id
router.delete('/coupon/:id', userAuth, deleteCouponById);

// retrieve expired coupons
router.get('/coupons/expired',userAuth, getExpiredCoupons);

module.exports = router;
