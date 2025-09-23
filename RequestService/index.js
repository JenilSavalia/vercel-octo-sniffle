import express from "express";
import axios from "axios";
import path from "path";
import dotenv from 'dotenv';
dotenv.config();

// CloudFront distribution URL for file downloads
const CLOUDFRONT_BASE_URL = process.env.CLOUDFRONT_URL;

const app = express();

/**
 * Get content type based on file extension
 * @param {string} filePath - The file path
 * @returns {string} Content type
 */
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.htm': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8',

        // Images
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.avif': 'image/avif',

        // Fonts
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
        '.eot': 'application/vnd.ms-fontobject',

        // Other common types
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.map': 'application/json', // Source maps
        '.webmanifest': 'application/manifest+json'
    };

    return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Validate subdomain ID (basic security check)
 * @param {string} id - The subdomain ID
 * @returns {boolean} Whether the ID is valid
 */
function isValidId(id) {
    // Allow alphanumeric characters, hyphens, and underscores
    // Length between 3-50 characters
    return /^[a-zA-Z0-9-_]{3,50}$/.test(id);
}

/**
 * Sanitize file path to prevent directory traversal
 * @param {string} filePath - The requested file path
 * @returns {string} Sanitized file path
 */
function sanitizePath(filePath) {
    // Remove any attempts at directory traversal
    return filePath.replace(/\.\./g, '').replace(/\/+/g, '/');
}

// Middleware for CORS (if needed for cross-origin requests)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`📋 ${new Date().toISOString()} - ${req.method} ${req.hostname}${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cloudfront: CLOUDFRONT_BASE_URL
    });
});

// Main route handler for serving ALL files from dist folder with SPA routing
app.use(async (req, res) => {
    try {
        // Extract ID from subdomain
        const host = req.hostname;
        const hostParts = host.split(".");

        if (hostParts.length < 2) {
            return res.status(400).json({
                error: 'Invalid hostname format. Expected: id.domain.com'
            });
        }

        const id = hostParts[0];

        // Validate ID
        if (!isValidId(id)) {
            console.error(`❌ Invalid ID: ${id}`);
            return res.status(400).json({
                error: 'Invalid subdomain ID format'
            });
        }

        // Get and sanitize file path - SERVE ALL FILES FROM DIST with SPA routing
        let filePath = req.path;
        const originalPath = req.path;

        console.log(`🔍 Serving from dist folder for project ${id} - Original path: ${filePath}`);

        // For SPA routing: detect if this is an asset request or route request
        const isAssetRequest = filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|json|xml|txt|pdf|zip|mp4|mp3|wav|webp|avif|eot|map|webmanifest)$/);

        // SPA routing logic:
        // 1. Root path or directories ending with / → serve index.html
        // 2. Any path that doesn't look like an asset → serve index.html (SPA routing)
        // 3. Actual assets → serve the asset file
        if (filePath === '/' || filePath.endsWith('/') || (!isAssetRequest && !filePath.includes('.'))) {
            filePath = 'index.html';
            console.log(`📄 SPA routing detected for project ${id}, serving dist/${id}/index.html for path: ${originalPath}`);
        } else {
            // Remove leading slash and sanitize for actual files
            filePath = sanitizePath(filePath.startsWith('/') ? filePath.substring(1) : filePath);
        }

        console.log(`🔍 Final file path: ${filePath}`);
        console.log(`🎯 File type: ${path.extname(filePath) || 'no extension'}`);

        // Construct CloudFront URL - CORRECTED: dist/{id}/{file} not {id}/dist/{file}
        const cloudFrontUrl = `${CLOUDFRONT_BASE_URL}/${id}/dist/${filePath}`;

        console.log(`🌐 Full CloudFront URL: ${cloudFrontUrl}`);
        console.log(`📁 Serving from dist/${id}/ folder structure`);

        // Fetch ANY file type from CloudFront (HTML, CSS, JS, images, fonts, etc.)
        const response = await axios({
            method: 'GET',
            url: cloudFrontUrl,
            responseType: 'arraybuffer', // Handle all file types (binary + text)
            timeout: 30000,
            headers: {
                'User-Agent': req.headers['user-agent'] || 'S3-Proxy-Server',
                'Accept': req.headers['accept'] || '*/*',
                'Accept-Encoding': req.headers['accept-encoding'] || 'gzip, deflate',
                ...(req.headers['if-none-match'] && { 'If-None-Match': req.headers['if-none-match'] }),
                ...(req.headers['if-modified-since'] && { 'If-Modified-Since': req.headers['if-modified-since'] })
            }
        });

        // Determine content type for ALL file types
        const contentType = response.headers['content-type'] || getContentType(filePath);

        console.log(`✅ File found! Content-Type: ${contentType}`);

        // Set response headers for ALL file types
        const headers = {
            'Content-Type': contentType,
            'Content-Length': response.headers['content-length'] || response.data.length
        };

        // Forward ALL caching headers from CloudFront
        if (response.headers['cache-control']) {
            headers['Cache-Control'] = response.headers['cache-control'];
        } else {
            // Different cache strategies for different file types
            if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
                headers['Cache-Control'] = 'public, max-age=31536000'; // 1 year for assets
            } else {
                headers['Cache-Control'] = 'public, max-age=3600'; // 1 hour for HTML
            }
        }

        if (response.headers['etag']) headers['ETag'] = response.headers['etag'];
        if (response.headers['last-modified']) headers['Last-Modified'] = response.headers['last-modified'];
        if (response.headers['content-encoding']) headers['Content-Encoding'] = response.headers['content-encoding'];

        // CORS for all files
        headers['Access-Control-Allow-Origin'] = '*';

        res.set(headers);

        // Send ANY file type from dist folder
        console.log(`✅ Served: dist/${id}/${filePath} (${contentType}, ${response.data.length} bytes)`);
        res.send(Buffer.from(response.data));

    } catch (error) {
        const originalPath = req.path;
        const id = req.hostname.split('.')[0];
        const filePath = originalPath === '/' ? 'index.html' : originalPath.substring(1);

        console.error(`❌ Failed to serve dist/${id}/${filePath}:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            expectedUrl: `${CLOUDFRONT_BASE_URL}/dist/${id}/${filePath}`
        });

        if (error.response) {
            const status = error.response.status;

            // For SPA routing: if file not found and it's not an asset, serve index.html
            if (status === 404) {
                const isAssetRequest = originalPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|json|xml|txt|pdf|zip|mp4|mp3|wav|webp|avif|eot|map|webmanifest)$/);

                if (!isAssetRequest && !originalPath.includes('.')) {
                    console.log(`🔄 SPA fallback for project ${id}: serving dist/${id}/index.html for 404 route: ${originalPath}`);

                    // Redirect to project-specific index.html for SPA routing
                    try {
                        const indexUrl = `${CLOUDFRONT_BASE_URL}/dist/${id}/index.html`;
                        console.log(`📄 Fetching SPA fallback from: ${indexUrl}`);

                        const indexResponse = await axios({
                            method: 'GET',
                            url: indexUrl,
                            responseType: 'arraybuffer',
                            timeout: 30000
                        });

                        res.set({
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=3600',
                            'Access-Control-Allow-Origin': '*'
                        });

                        console.log(`✅ SPA fallback served for project ${id}: index.html for route ${originalPath}`);
                        return res.send(Buffer.from(indexResponse.data));

                    } catch (indexError) {
                        console.error(`❌ Failed to serve index.html fallback for project ${id}:`, indexError.message);
                    }
                }

                res.status(404).json({
                    error: 'File not found in dist folder',
                    path: originalPath,
                    projectId: id,
                    distPath: `dist/${id}/${filePath}`,
                    cloudFrontUrl: error.config?.url,
                    expectedUrl: `${CLOUDFRONT_BASE_URL}/dist/${id}/${filePath}`,
                    suggestions: [
                        'Check if the file exists in your build output',
                        'Verify the file was uploaded to S3',
                        'For SPA routing, make sure index.html exists'
                    ]
                });
            } else if (status === 403) {
                res.status(403).json({
                    error: 'Access forbidden',
                    path: originalPath,
                    projectId: id,
                    distPath: `dist/${id}/${filePath}`,
                    cloudFrontUrl: error.config?.url,
                    expectedUrl: `${CLOUDFRONT_BASE_URL}/dist/${id}/${filePath}`,
                    suggestions: [
                        'Check CloudFront distribution permissions',
                        'Verify S3 bucket policy allows CloudFront access'
                    ]
                });
            } else if (status >= 500) {
                res.status(503).json({
                    error: 'Service unavailable',
                    path: originalPath,
                    cloudFrontStatus: status,
                    suggestion: 'CloudFront or origin server error. Try again later.'
                });
            } else {
                res.status(status).json({
                    error: 'CloudFront error',
                    status: status,
                    statusText: error.response.statusText,
                    path: originalPath
                });
            }
        } else if (error.code === 'ECONNABORTED') {
            res.status(504).json({
                error: 'Request timeout',
                path: originalPath,
                suggestion: 'CloudFront request timed out. Try again.'
            });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: 'Service unavailable',
                message: 'Cannot connect to CloudFront',
                suggestion: 'Check internet connection and CloudFront URL'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                suggestion: 'Check server logs for details'
            });
        }
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 CloudFront Proxy Server running on port ${PORT}`);
    console.log(`☁️  Serving files from CloudFront: ${CLOUDFRONT_BASE_URL}`);
    console.log(`🌐 Format: http://project-id.localhost:${PORT}/path/to/file`);
    console.log(`💡 Example: http://qc26a.localhost:${PORT}/index.html`);
    console.log(`🎯 SPA routing: All non-asset routes serve project-specific index.html`);
});

export default app;