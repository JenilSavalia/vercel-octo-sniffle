import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import axios from "axios"; // For CloudFront downloads
import dotenv from 'dotenv';
dotenv.config();

// S3 client for API operations (list objects)
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION || "us-east-1",
    forcePathStyle: true // For bucket names with dots
});

// CloudFront base URL for downloads
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

/**
 * Downloads all files from S3 folder using S3 API + CloudFront downloads
 */
export async function downloadS3Folder(
    prefix,
    localDir = "./downloads",
    bucketName = process.env.S3_BUCKET_NAME
) {
    console.log(`🚀 Starting download from s3://${bucketName}/${prefix}`);

    try {
        // Use S3 API to list objects
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix
        });

        const listResponse = await s3Client.send(listCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            console.log(`📁 No files found with prefix: ${prefix}`);
            return { totalFiles: 0, successful: 0, failed: 0, results: [] };
        }

        console.log(`📂 Found ${listResponse.Contents.length} files to download`);

        const files = listResponse.Contents.filter(obj =>
            obj.Key && !obj.Key.endsWith('/')
        );

        // Download files using CloudFront URLs
        const downloadPromises = files.map(async (obj) => {
            if (!obj.Key) {
                return { success: false, key: 'unknown', error: 'No key found' };
            }
            return downloadFromCloudFront(obj.Key, localDir);
        });

        console.log(`⏳ Downloading ${downloadPromises.length} files...`);
        const results = await Promise.all(downloadPromises);

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n📊 Download Summary:`);
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);

        return { totalFiles: results.length, successful, failed, results };

    } catch (error) {
        console.error('❌ Error listing S3 objects:', error);
        throw error;
    }
}

/**
 * Download file from CloudFront using HTTP request
 */
async function downloadFromCloudFront(key, localDir) {
    try {
        const localFilePath = path.join(localDir, key);
        const dirName = path.dirname(localFilePath);

        await fs.promises.mkdir(dirName, { recursive: true });

        // CloudFront URL
        const fileUrl = `${CLOUDFRONT_URL}/${key}`;
        
        console.log(`⏳ Downloading from CloudFront: ${key}`);
        
        // Download using axios
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream'
        });

        const writeStream = fs.createWriteStream(localFilePath);
        await pipeline(response.data, writeStream);

        console.log(`✅ Downloaded: ${key}`);
        return { success: true, key, localPath: localFilePath };

    } catch (error) {
        console.error(`❌ Error downloading ${key}:`, error.message);
        return { success: false, key, error: error.message };
    }
}

// downloadS3Folder("qc26a");