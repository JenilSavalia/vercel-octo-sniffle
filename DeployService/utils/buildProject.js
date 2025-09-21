import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildProject(id) {
    return new Promise((resolve, reject) => {
        const child = exec(`cd ${path.join(__dirname, `downloads/${id}`)} && npm install && npm run build`)

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
            if (code === 0) {
                resolve("Build successful");
            } else {
                reject(`Build failed with code ${code}`);
            }
        });
    });
}

// buildProject("qc26a")
//     .then(result => console.log(result))
//     .catch(error => console.error(error));
