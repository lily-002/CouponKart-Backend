const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
  companyName: { type: String},
  registerationNumber: { type: String},
  ownerName: { type: String},
  bankAccountNumber: { type: String},
  panNumber: { type: String},
  companyRegAddress: { type: String},
});

// Define the schema for the user collection
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    role: { 
      type: String, 
      enum: ['admin', 'user', 'retailer'],
      required: true,
    },
    company: companySchema,
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
