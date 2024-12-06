// validateRetailer.js
const { check } = require('express-validator');

exports.validateUser = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),

    check('email')
        .isEmail()
        .withMessage('Invalid email format'),

    check('mobile')
        .notEmpty()
        .withMessage('Mobile number is required')
        .isMobilePhone()
        .withMessage('Invalid mobile number'),

    // check('companyName')
    //     .notEmpty()
    //     .withMessage('Company name is required'),

    // check('registerationNumber')
    //     .notEmpty()
    //     .withMessage('Registration number is required')
    //     .matches(/^[A-Za-z0-9-]+$/)
    //     .withMessage('Registration number must contain only alphanumeric characters and dashes'),

    // check('ownerName')
    //     .notEmpty()
    //     .withMessage('Owner name is required')
    //     .isAlpha('en-US', { ignore: ' ' })
    //     .withMessage('Owner name must contain only alphabets'),

    // check('bankAccountNumber')
    //     .notEmpty()
    //     .withMessage('Bank account number is required')
    //     .isNumeric()
    //     .withMessage('Bank account number must be numeric')
    //     .isLength({ min: 10, max: 18 })
    //     .withMessage('Bank account number must be between 10 to 18 digits'),

    // check('panNumber')
    //     .notEmpty()
    //     .withMessage('PAN number is required')
    //     .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)
    //     .withMessage('Invalid PAN number format'),

    // check('companyRegAddress')
    //     .notEmpty()
    //     .withMessage('Company registration address is required')
    //     .isLength({ min: 10 })
    //     .withMessage('Company registration address must be at least 10 characters long'),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    check('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
        
    // Role validation
    check('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'user', 'manager']) // Adjust according to your allowed roles
        .withMessage('Invalid role name')
];
