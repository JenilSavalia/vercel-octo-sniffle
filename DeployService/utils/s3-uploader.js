import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pkg from 'redis';
const { createClient } = pkg;

dotenv.config();


class S3Uploader {
    constructor() {

        this.bucketName = process.env.S3_BUCKET_NAME;


        // Validate bucket name
        if (!this.bucketName) {
            throw new Error('Bucket name is required. Set S3_BUCKET_NAME environment variable or pass it to constructor.');
        }
        console.log(process.env.S3_BUCKET_NAME)

        // Validate other required configs
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error('AWS credentials are required. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
        }



        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        });
    }

    async uploadSingleFile(filePath, s3Key) {
        try {
            const fileStream = fs.createReadStream(filePath);
            const stats = fs.statSync(filePath);

            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucketName,
                    Key: s3Key,
                    Body: fileStream,
                    ContentLength: stats.size,
                    ContentType: this.getContentType(filePath)
                }
            });

            const response = await upload.done();
            return {
                success: true,
                location: response.Location,
                key: s3Key
            };
        } catch (error) {
            console.error(`Error uploading ${filePath}:`, error);
            return {
                success: false,
                error: error.message,
                key: s3Key
            };
        }
    }

    async uploadMultipleFiles(files) {
        const results = [];

        for (const file of files) {
            const fileName = path.basename(file);
            const s3Key = `uploads/${Date.now()}-${fileName}`;

            console.log(`Uploading ${fileName}...`);
            const result = await this.uploadSingleFile(file, s3Key);
            results.push(result);
        }

        return results;
    }

    async uploadDirectory(dirPath, s3Prefix, id) {
        const files = this.getAllFiles(dirPath);
        console.log(files)
        const results = [];
        const redisClient = createClient();
        await redisClient.connect();


        for (const file of files) {
            const relativePath = path.relative(dirPath, file);
            const s3Key = path.join(s3Prefix, relativePath).replace(/\\/g, '/');

            console.log(`Uploading ${relativePath}...`);
            redisClient.publish(`logs:${id}`, `Uploading ${relativePath}...`);
            const result = await this.uploadSingleFile(file, s3Key);
            results.push(result);
        }

        return results;
    }

    getAllFiles(folderPath) {
        let response = [];

        const allFilesAndFolders = fs.readdirSync(folderPath);
        allFilesAndFolders.forEach(file => {
            if (file === '.git' || file === 'node_modules') {
                return; // Skip these folders
            }

            const fullFilePath = path.join(folderPath, file);
            if (fs.statSync(fullFilePath).isDirectory()) {
                response = response.concat(this.getAllFiles(fullFilePath));
            } else {
                response.push(fullFilePath);
            }
        });
        return response;
    }

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.zip': 'application/zip'
        };
        return types[ext] || 'application/octet-stream';
    }
}

// Usage
export default S3Uploader;