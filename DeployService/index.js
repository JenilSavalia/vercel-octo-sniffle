import pkg from 'redis';
const { createClient, commandOptions } = pkg;
import cors from 'cors';
import express from "express";
import S3Uploader from './utils/s3-uploader.js';
import { buildProject } from './utils/buildProject.js'
import { downloadS3Folder } from './utils/s3-downloader.js'


const uploader = new S3Uploader();
// Create Redis client
const redisClient = createClient();
await redisClient.connect();


const app = express();
app.use(cors())
app.use(express.json());

const subscriber = createClient();
await subscriber.connect();



async function main() {

    console.log("🚀 Worker listening for jobs on 'build-queue'...");
    // subscriber.publish(`logs:uppe3`, `🚀 Worker listening for jobs on 'build-queue'...`);


    while (true) {
        try {
            const res = await subscriber.brPop(
                'build-queue',
                0 // 0 = block indefinitely until a value is available
            );

            if (res && res.element) {
                const jobId = res.element;
                console.log(`🛠️ Received job: ${jobId}`);
                subscriber.publish(`logs:${jobId}`, `Received job: ${jobId}`);
                // Process the job
                await handleJob(jobId);
            }
        } catch (error) {
            console.error("❌ Error in worker loop:", error);
            subscriber.publish(`logs:${jobId}`, `❌ Error in worker loop: ${error}`);
            // Optional: Wait before retrying to avoid tight loop
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

async function handleJob(id) {
    try {
        //     // 1. Download the uploaded source from S3
        await downloadS3Folder(id);

        //     // 2. Build the project (this is your custom logic)
        await buildProject(id);


        //     // 3. Upload the build output to S3
        const dirResults = await uploader.uploadDirectory(`./downloads/${id}/dist`, `${id}/dist`, id);

        // 4. Updating redis 

        // Set the `id` status as "uploaded" in the "status" hash
        await subscriber.hSet("status", id, "deployed");
        console.log(`Set status of ${id} to "deployed"`);
        subscriber.publish(`logs:${id}`, `${id}: deployed`);


        console.log(`✅ Job ${id} completed`);
        subscriber.publish(`logs:${id}`, `✅ Job ${id} completed`);


    } catch (error) {
        console.error(`❌ Failed to process job ${id}:`, error);
        subscriber.publish(`logs:${id}`, `❌ Failed to process job ${id}: ${error}`);

    }
    console.log("Handling JOB for ", id)
}



main();

app.listen(3001, () => {
    console.log("Listning on PORT 3001")
});
