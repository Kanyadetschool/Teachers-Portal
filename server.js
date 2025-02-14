const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware to generate nonce for each request
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// Serve static files with proper headers
app.use(express.static('public', {
    setHeaders: (res, path) => {
        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Route to render login page
app.get('/login', (req, res) => {
    res.render('login', { 
        nonce: res.locals.nonce,
        apiKey: process.env.FIREBASE_API_KEY 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
