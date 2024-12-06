// Required imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const userRoutes = require('./routes/userRoutes'); // Ensure the path is correct
const couponRoutes = require('./routes/couponRoutes');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
const corsOptions = {
    origin: "http://localhost:3000", // Replace with your React app's URL
    methods: ["GET", "POST", "PUT", "DELETE", "UPDATE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (to manage user sessions for OAuth login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if you're using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // To prevent client-side access to cookies
        sameSite: 'None' // Required for cross-origin requests
    },
    credentials: true, // Allow cookies to be sent with requests
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);  // Exit the application if MongoDB connection fails
    });


// Passport initialize and session middleware (must be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret
            scope: 'openid profile email', // Scopes for user info and email
            callbackURL: 'http://localhost:5001/auth/google/callback', // Your Redirect URI
        },
        (accessToken, refreshToken, profile, done) => {
            // After user logs in, profile is returned here.
            // You can use this data to store the user's info in your DB
            return done(null, profile);
        }
    )
);

// Facebook Login Route
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

// Facebook Callback Route
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => res.json({ message: 'Facebook login successful!', user: req.user })
);

// Facebook OAuth strategy configuration
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID, // Your Facebook App ID
      clientSecret: process.env.FACEBOOK_APP_SECRET, // Your Facebook App Secret
      callbackURL: 'http://localhost:5001/auth/facebook/callback', // Callback URL after login
      profileFields: ['id', 'displayName', 'email'], // Fields to request from the user's profile
    },
    (accessToken, refreshToken, profile, done) => {
      // Use profile information (like email and id) to handle the login
      return done(null, profile);
    }
  )
);


// Routes
app.get('/', (req, res) => res.send('Welcome to OAuth login!'));

// Google Login
app.get('/auth/google', passport.authenticate('google', {
    scope: ['openid', 'profile', 'email'],
    accessType: 'offline', // Optional: Allows you to request a refresh token
    includeGrantedScopes: true, // Optional: Include previously granted scopes
}));

// Callback route that Google will redirect to after user logs in
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful login
        res.redirect('/dashboard');
    }
);

// // Facebook Login
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// app.get(
//     '/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => res.json({ message: 'Facebook login successful!', user: req.user })
// );

// Logout
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.send('Logged out!');
    });
});

// Routes for API endpoints
app.use('/api', userRoutes);
app.use('/api', couponRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/api`));
