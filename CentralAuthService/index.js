const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = 3001;  // Central Auth Service runs on port 3001

// GitHub OAuth app credentials
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:3001/oauth/callback';  // Callback URL

// JWT Secret for signing the tokens
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory storage for users (use a database in production)
let users = {};  // Temporarily storing user data (replace with DB)

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173', // or your frontend URL
    credentials: true               // 👈 Allow cookies to be sent
}));

// Step 1: Redirect user to GitHub OAuth page for authentication
app.get('/login', (req, res) => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&scope=repo`;

    // Redirect to GitHub OAuth page
    res.redirect(authUrl);
});

// Step 2: Handle GitHub OAuth callback and exchange code for access token
app.get('/oauth/callback', async (req, res) => {
    const { code } = req.query;  // The authorization code from GitHub

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post('https://github.com/login/oauth/access_token', null, {
            params: {
                client_id: clientID,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            },
            headers: {
                'Accept': 'application/json',
            },
        });

        const { access_token } = response.data;

        if (!access_token) {
            return res.status(400).send('Failed to get access token');
        }

        // Step 3: Use the access token to fetch the user’s GitHub profile
        const profileResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const profile = profileResponse.data;

        // Store the user in memory (or in a database)
        users[profile.id] = { access_token, profile };

        // Step 4: Generate a JWT token for this user
        const jwtToken = jwt.sign({ userId: profile.id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: true, // Set to true if using HTTPS
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.json({ user: profile });
    } catch (error) {
        console.error('Error exchanging code for access token:', error);
        res.status(500).send('Error during OAuth flow');
    }
});

// Middleware to verify JWT token
const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // "Bearer <token>"

    if (!token) return res.status(403).send('Access denied: No token provided');

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Access denied: Invalid or expired token');
        req.user = decoded;  // Store user info in request
        next();
    });
};

// Example: Protected route to access a resource (e.g., create webhook, upload)
app.get('/checkCreds', verifyJWT, (req, res) => {
    // Protected route logic (only accessible with a valid JWT token)
    res.send('This is a protected resource');
});





async function createWebhook(access_token, repoOwner, repoName) {
    const response = await axios.post(
        `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`,
        {
            config: {
                url: 'https://your-backend-service.com/webhook', // Your webhook handler URL
                content_type: 'json',
            },
            events: ['push'],
            active: true,
        },
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    console.log('Webhook created:', response.data);
}


// Start the Express server
app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});
