const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        couponName: { type: String, required: true },
        couponCode: { type: String, required: true, unique: true }, // alphanumeric
        couponType: { type: String, required: true },
        couponCategory: {type: String, required: true},
        amountTobePay: { type: Number, required: true }, // Changed to Number for monetary value
        validity: { 
            type: Date, 
            required: true, 
            // unique: true // Ensure this is unique to a specific date, but if it's the expiry date, unique might not be necessary
        }, 
        validatePerson: { 
            type: Number, // Number of persons who can redeem the coupon
            required: true 
        }, 
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        couponStatus: { type: String, required: true },
        retailerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Retailer', // Reference to the Retailer model
            required: true 
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// To populate the retailer's name when querying coupons
couponSchema.virtual('retailer', {
    ref: 'Retailer',
    localField: 'retailerId',
    foreignField: '_id',
    justOne: true
});

// TTL Index (set expiration time based on the validity date)
couponSchema.index({ validity: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Coupon', couponSchema);
