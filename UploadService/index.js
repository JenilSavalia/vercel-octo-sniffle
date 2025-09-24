import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils/utils.js";
import { createClient } from "redis";
import fs from 'fs-extra'
import S3Uploader from './utils/s3-uploader.js';
import { publishBuildStatus } from './utils/redisPublisher.js'
import bodyParser from 'body-parser'

const uploader = new S3Uploader();
// const dirResults = await uploader.uploadDirectory('./output', "7jakj");

// console.log('Upload results:', dirResults);

// Create Redis client
const redisClient = createClient();
await redisClient.connect();


const app = express();
app.use(cors())
app.use(express.json());

app.post("/api/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;

    if (!repoUrl) {
        return res.status(400).json({ error: "Missing repoUrl" });
    }

    const id = generate(); // Example: "asd12"
    const targetDir = `output/${id}`;

    try {
        // Clone the repository into a subfolder
        await simpleGit().clone(repoUrl, targetDir);

        // Remove .git directory to avoid uploading unnecessary metadata
        await fs.remove(`${targetDir}/.git`);

        // Upload the specific output/id directory, not the whole output folder
        const dirResults = await uploader.uploadDirectory(`./output/${id}`,id);
        console.log(dirResults)
        await publishBuildStatus(id);
        res.json({ id });
    } catch (error) {
        console.error("Deploy error:", error);
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

app.listen(3000);