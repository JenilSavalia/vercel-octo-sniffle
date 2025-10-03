import Redis from "ioredis";

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, { cors: { origin: "*" } });

const redis = new Redis();



// async function simulateUpload(uploadId) {
//     redis.publish(`logs:${uploadId}`, "Cloning repo...");
//     await new Promise(r => setTimeout(r, 1000));

//     redis.publish(`logs:${uploadId}`, "Uploading to S3...");
//     await new Promise(r => setTimeout(r, 1000));

//     redis.publish(`logs:${uploadId}`, "Upload completed ✅");
// }

// simulateUpload("abc123");




io.on("connection", (socket) => {
    const uploadId = socket.handshake.query.uploadId;
    console.log("Client connected for logs:", uploadId);

    const subscriber = new Redis();
    subscriber.subscribe(`logs:${uploadId}`);

    subscriber.on("message", (_, message) => {
        socket.emit("log", message);
    });

    socket.on("disconnect", () => {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

httpServer.listen(4000, () => console.log("Log Gateway running on :4000"));

