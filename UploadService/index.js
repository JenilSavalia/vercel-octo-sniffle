import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils/utils.js";
import { createClient } from "redis";
import fs from 'fs-extra'
import S3Uploader from './utils/s3-uploader.js';
import { publishBuildStatus } from './utils/redisPublisher.js'
import bodyParser from 'body-parser'
import { MongoClient } from 'mongodb'
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"

const uploader = new S3Uploader();
// const dirResults = await uploader.uploadDirectory('./output', "7jakj");

// console.log('Upload results:', dirResults);

// Create Redis client
const redisClient = createClient();
await redisClient.connect();

// const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DBNAME || 'central_auth_vercel_octa';
let usersCollection;

MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db(mongoDbName);
        usersCollection = db.collection('users');
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });



const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const verifyJWT = (req, res, next) => {
    // Read token from cookie instead of Authorization header
    const token = req.cookies.token;

    if (!token) return res.status(403).send('Access denied: No token provided');

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Access denied: Invalid or expired token');
        req.user = decoded;
        next();
    });
};

app.post("/api/deploy", verifyJWT, async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const deploymentName = req.body.deploymentName;
    const deploymentType = req.body.deploymentType;

    if (!repoUrl) {
        return res.status(400).json({ error: "Missing repoUrl" });
    }

    const id = generate(); // Example: "asd12"
    redisClient.publish(`logs:${id}`, `id generated : ${id}`);
    const targetDir = `output/${id}`;

    try {
        // Clone the repository into a subfolder
        await simpleGit().clone(repoUrl, targetDir);
        redisClient.publish(`logs:${id}`, `Repository Cloned ${repoUrl}`);
        // Remove .git directory to avoid   uploading unnecessary metadata
        await fs.remove(`${targetDir}/.git`);

        // Upload the specific output/id directory, not the whole output folder
        const dirResults = await uploader.uploadDirectory(`./output/${id}`, id);
        // console.log(dirResults)
        await publishBuildStatus(id);

        if (!usersCollection) return res.status(500).json({ error: 'DB not ready' });
        const userId = req.user.userId;
        const user = await usersCollection.findOne({ githubId: userId });


        // Add deployment record to user
        if (usersCollection) {
            await usersCollection.updateOne(
                { githubId: userId },
                {
                    $push: {
                        deployments: {
                            jobid: id,
                            deploymentName: deploymentName,
                            deploymentType: deploymentType,
                            repo: repoUrl,
                            projectId: null,
                            logs: []
                        }
                    }
                }
            );
        }


        res.json({ id });
    } catch (error) {
        console.error("Deploy error:", error);
        redisClient.publish(`logs:${id}`, `Deploy error:, ${error}`);
        res.status(500).json({ error: "Failed to deploy repository" });
    }
});



app.use('/webhook', bodyParser.json({ verify: rawBodySaver }));
function rawBodySaver(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}


// Route to receive webhook POST events from GitHub
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event'];


    // Log the event type and payload
    console.log(`📦 Received GitHub event: ${event}`);
    console.log('Payload:', req.body);

    // You can handle specific event types
    if (event === 'push') {
        const payload = req.body;
        console.log(`🔔 Push to ${payload.repository.full_name} by ${payload.pusher.name}`);
    }

    // Respond to GitHub
    res.status(200).send('Webhook received');
});



// http://0.0.0.0:3000/api/status?id=build_12345
app.get("/api/status", async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Missing 'id' query parameter" });
    }

    try {
        const response = await redisClient.hGet("status", id);
        if (response === null) {
            return res.status(404).json({ status: "not found" });
        }

        res.json({ status: response });
    } catch (err) {
        console.error("Redis error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


app.listen(3000, () => {
    console.log(`🚀 Upload Server running on port 3000`);
});