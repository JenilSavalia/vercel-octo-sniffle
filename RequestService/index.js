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

// Test CloudFront connectivity
// app.get('/test-cloudfront/:id?', async (req, res) => {
//     try {
//         const testId = req.params.id || 'test';
//         const testPath = 'index.html';
//         const testUrl = `${CLOUDFRONT_BASE_URL}/dist/${testId}/${testPath}`;

//         console.log(`🧪 Testing CloudFront access: ${testUrl}`);

//         const response = await axios({
//             method: 'GET',
//             url: testUrl,
//             timeout: 10000,
//             validateStatus: () => true // Don't throw on 4xx/5xx
//         });

//         res.json({
//             success: response.status === 200,
//             url: testUrl,
//             status: response.status,
//             statusText: response.statusText,
//             contentType: response.headers['content-type'],
//             contentLength: response.headers['content-length'],
//             cacheControl: response.headers['cache-control'],
//             lastModified: response.headers['last-modified'],
//             etag: response.headers['etag']
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message,
//             code: error.code,
//             suggestion: 'Check CloudFront distribution and network connectivity'
//         });
//     }
// });

// Main route handler for serving files via CloudFront
app.use( async (req, res) => {
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

        // Get and sanitize file path
        let filePath = req.path;

        // Default to index.html for root path or directories
        if (filePath === '/' || filePath.endsWith('/')) {
            filePath = filePath + 'index.html';
        }

        // Remove leading slash and sanitize
        filePath = sanitizePath(filePath.startsWith('/') ? filePath.substring(1) : filePath);

        // Construct CloudFront URL
        const cloudFrontUrl = `${CLOUDFRONT_BASE_URL}/${id}/dist/${filePath}`;

        console.log(`🌐 Fetching from CloudFront: ${cloudFrontUrl}`);

        // Fetch file from CloudFront using HTTP request
        const response = await axios({
            method: 'GET',
            url: cloudFrontUrl,
            responseType: 'arraybuffer', // Get binary data
            timeout: 30000, // 30 second timeout
            headers: {
                // Forward some headers from original request
                'User-Agent': req.headers['user-agent'] || 'S3-Proxy-Server',
                'Accept': req.headers['accept'] || '*/*',
                'Accept-Encoding': req.headers['accept-encoding'] || 'gzip, deflate',
                // Forward conditional headers for caching
                ...(req.headers['if-none-match'] && { 'If-None-Match': req.headers['if-none-match'] }),
                ...(req.headers['if-modified-since'] && { 'If-Modified-Since': req.headers['if-modified-since'] })
            }
        });

        // Determine content type (CloudFront might not set it correctly)
        const contentType = response.headers['content-type'] || getContentType(filePath);

        // Set response headers
        const headers = {
            'Content-Type': contentType,
            'Content-Length': response.headers['content-length'] || response.data.length
        };

        // Forward caching headers from CloudFront
        if (response.headers['cache-control']) {
            headers['Cache-Control'] = response.headers['cache-control'];
        } else {
            headers['Cache-Control'] = 'public, max-age=3600'; // Default 1 hour cache
        }

        if (response.headers['etag']) {
            headers['ETag'] = response.headers['etag'];
        }

        if (response.headers['last-modified']) {
            headers['Last-Modified'] = response.headers['last-modified'];
        }

        if (response.headers['content-encoding']) {
            headers['Content-Encoding'] = response.headers['content-encoding'];
        }

        // Set CORS headers if needed
        headers['Access-Control-Allow-Origin'] = '*';

        res.set(headers);

        // Send the file
        console.log(`✅ Served via CloudFront: dist/${id}/${filePath} (${contentType}, ${response.data.length} bytes)`);
        res.send(Buffer.from(response.data));

    } catch (error) {
        console.error(`❌ Error serving ${req.hostname}${req.path}:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
        });

        if (error.response) {
            // HTTP error from CloudFront
            const status = error.response.status;

            if (status === 404) {
                res.status(404).json({
                    error: 'File not found',
                    path: req.path,
                    id: req.hostname.split('.')[0],
                    cloudFrontUrl: error.config?.url,
                    suggestion: 'Check if the file exists and was deployed correctly'
                });
            } else if (status === 403) {
                res.status(403).json({
                    error: 'Access forbidden',
                    path: req.path,
                    cloudFrontUrl: error.config?.url,
                    suggestions: [
                        'Check CloudFront distribution permissions',
                        'Verify S3 bucket policy allows CloudFront access',
                        'Check if CloudFront distribution is deployed'
                    ]
                });
            } else if (status >= 500) {
                res.status(503).json({
                    error: 'Service unavailable',
                    path: req.path,
                    cloudFrontStatus: status,
                    suggestion: 'CloudFront or origin server error. Try again later.'
                });
            } else {
                res.status(status).json({
                    error: 'CloudFront error',
                    status: status,
                    statusText: error.response.statusText,
                    path: req.path
                });
            }
        } else if (error.code === 'ECONNABORTED') {
            // Timeout
            res.status(504).json({
                error: 'Request timeout',
                path: req.path,
                suggestion: 'CloudFront request timed out. Try again.'
            });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            // Network error
            res.status(503).json({
                error: 'Service unavailable',
                message: 'Cannot connect to CloudFront',
                suggestion: 'Check internet connection and CloudFront URL'
            });
        } else {
            // Other errors
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                suggestion: 'Check server logs for details'
            });
        }
    }
});

// Serve favicon.ico from root if no subdomain
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No Content
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        hostname: req.hostname,
        note: 'Make sure to use subdomain format: project-id.domain.com'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 CloudFront Proxy Server running on port ${PORT}`);
    console.log(`☁️  Serving files from CloudFront: ${CLOUDFRONT_BASE_URL}`);
    console.log(`🌐 Format: http://project-id.localhost:${PORT}/path/to/file`);
    console.log(`💡 Example: http://qc26a.localhost:${PORT}/index.html`);
    console.log(`🧪 Test: http://localhost:${PORT}/test-cloudfront/qc26a`);
});
