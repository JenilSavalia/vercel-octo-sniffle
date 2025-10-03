import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'redis';
const { createClient } = pkg;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const redisClient = createClient();
await redisClient.connect();


export function buildProject(id) {
    return new Promise((resolve, reject) => {
        const buildPath = `D:/vercel-octo-sniffle/DeployService/downloads/${id}`;
        const child = exec(`cd ${buildPath} && npm install && npm run build`)
        redisClient.publish(`logs:${id}`, `npm install && npm run build`);
        console.log(buildPath)
        child.stdout?.on('data', function (data) {
            console.log('stdout: ' + data);
            redisClient.publish(`logs:${id}`, `stdout: ${data}`);
        });

        child.stderr?.on('data', function (data) {
            console.log('stderr: ' + data);
            redisClient.publish(`logs:${id}`, `stderr: ${data}`);
        });

        child.on('close', function (code) {
            if (code === 0) {
                resolve("Build successful");
                redisClient.publish(`logs:${id}`, `Build successful`);

            } else {
                reject(`Build failed with code ${code}`);
                redisClient.publish(`logs:${id}`, `Build failed with code ${code}`);
            }
        });
    });
}

// buildProject("q1agk")
//     .then(result => console.log(result))
//     .catch(error => console.error(error));
