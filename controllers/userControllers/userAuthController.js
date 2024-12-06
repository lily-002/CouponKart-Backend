//authController.js
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
require("dotenv").config();
const express = require("express");
const check = require('express-validator');
// Login function
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Password is correct, create a JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload
            process.env.JWT_SECRET, // Secret key from .env file
            { expiresIn: "1h" } // Token expiration time (1 hour)
        );

        // Send the response with the token
        res.status(200).json({
            message: "Login successful",
            user: { name: user.name, email: user.email },
            token, // Include the token in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude password field
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId, "-password"); // Exclude password field
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update user by ID
exports.updateUserById = async (req, res) => {
    const userId = req.params.id;
    const { name, email, mobile, password } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if email or mobile is already in use by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }

        if (mobile && mobile !== user.mobile) {
            const mobileExists = await User.findOne({ mobile });
            if (mobileExists) {
                return res
                    .status(400)
                    .json({ message: "Mobile number is already in use" });
            }
            user.mobile = mobile;
        }

        // Update fields
        user.name = name || user.name;

        // Hash password if it's being updated
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        // Save updated user
        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Logout function (Session-Based Authentication)
exports.logoutUser = (req, res) => {
    const router = express.Router();
    try {
        // Destroy the session (if using express-session or similar)
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to destroy session", error: err });
            }

            // Send response with login URL or logout success message
            res.status(200).json({
                message: "Logout successful. Please login again.",
                // loginUrl: router.post(
                //     '/users/login',
                //     [
                //         check('email', 'Please include a valid email').isEmail(),
                //         check('password', 'Password is required').exists(),
                //     ],
                //     loginUser
                // ), // Update with your actual login URL
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

