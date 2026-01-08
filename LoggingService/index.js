import { MongoClient } from "mongodb";

// MongoDB setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DBNAME || 'central_auth_vercel_octa';
let usersCollection;

MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db(mongoDbName);
        usersCollection = db.collection('users');
        console.log('Connected to MongoDB (LoggingService)');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
import Redis from "ioredis";

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, { cors: { origin: "*" } });

const redis = new Redis();



// async function simulateUpload() {
//     // redis.publish(`logs:${uploadId}`, "Cloning repo...");
//     // await new Promise(r => setTimeout(r, 1000));

//     // redis.publish(`logs:${uploadId}`, "Uploading to S3...");
//     // await new Promise(r => setTimeout(r, 1000));

//     redis.publish(`logs:uppe3`, "Upload completed ✅");
// }

// simulateUpload()




io.on("connection", (socket) => {
    const uploadId = socket.handshake.query.uploadId;
    const userID = socket.handshake.query.userID;
    console.log("Client connected for logs:", uploadId, " ", userID);

    const subscriber = new Redis();
    subscriber.subscribe(`logs:${uploadId}`);


    subscriber.on("message", async (_, message) => {
        socket.emit("log", message);
        // Also add log to MongoDB for this deployment
        if (usersCollection && uploadId && userID) {
            console.log('[LOGGING] userID:', userID, 'uploadId:', uploadId);
            // Find the user by userID
            const user = await usersCollection.findOne({ githubId: Number(userID) });
            console.log('[LOGGING] found user:', user ? user.githubId : null);
            if (user && Array.isArray(user.deployments)) {
                // Find the index of the deployment with the matching jobid
                const depIdx = user.deployments.findIndex(dep => dep.jobid === uploadId);
                console.log('[LOGGING] deployment index:', depIdx);
                if (depIdx !== -1) {
                    // Use positional operator to update the correct deployment's logs
                    const logsPath = `deployments.${depIdx}.logs`;
                    const updateResult = await usersCollection.updateOne(
                        { githubId: Number(userID) },
                        { $push: { [logsPath]: message } }
                    );
                    console.log('[LOGGING] update result:', updateResult);
                } else {
                    console.log('[LOGGING] No deployment found for jobid:', uploadId);
                }
            } else {
                console.log('[LOGGING] No user or deployments array found');
            }
        }
    });

    socket.on("disconnect", () => {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

httpServer.listen(4000, () => console.log("Log Gateway running on :4000"));

