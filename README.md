# Static Site Deployment Platform - vercel-octo-sniffle 🚀

A production-ready static site deployment platform similar to Vercel/Netlify, built with AWS infrastructure and microservices architecture. Deploy your static websites with a single GitHub URL and get them live instantly with global CDN distribution.

## 🎯 Overview

This platform provides a complete continuous deployment pipeline for static websites, leveraging AWS S3 for storage, CloudFront CDN for global content delivery, and Redis Streams for service orchestration. Users can deploy their web applications by simply providing a GitHub repository URL, and the system automatically handles cloning, building, deploying, and serving the application worldwide.

## 🏗️ Architecture

The project follows a microservices architecture with the following components:

```
                    ┌─────────────┐
                    │   Frontend  │ ◄─── WebSocket (Live Logs)
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────────────┐
                    │  CentralAuthService │ (JWT-based Authentication)
                    └──────────┬──────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
            ┌───────────────┐      ┌──────────────┐
            │ Upload Service│      │Request Service│
            └───────┬───────┘      └──────┬───────┘
                    │                     │
                    ▼                     ▼
            ┌───────────────┐      ┌─────────────┐
            │ Redis Streams │      │ CloudFront  │
            │    (Queue)    │      │     CDN     │
            └───────┬───────┘      └──────┬──────┘
                    │                     │
                    ▼                     ▼
            ┌───────────────┐         ┌────────┐
            │ Deploy Service│────────►│ AWS S3 │
            └───────┬───────┘         └────────┘
                    │
                    │ (Build Logs)
                    ▼
            ┌───────────────┐
            │Logging Service│ ───► WebSocket Stream to Frontend
            └───────────────┘
```

### Services

#### 1. **Frontend**
- User interface for interacting with the deployment platform
- Submit GitHub repository URLs for deployment
- Real-time deployment status updates via WebSockets
- Live streaming logs from build and deployment processes
- Access deployed applications through CDN URLs

#### 2. **CentralAuthService**
- Centralized authentication system for all services
- JWT-based authentication and authorization
- Manages API keys and access tokens
- Validates user permissions for deployments
- Secure inter-service communication

#### 3. **UploadService**
- Receives GitHub repository URLs from users
- Clones projects from GitHub repositories
- Generates unique deployment IDs
- Uploads project files to AWS S3
- Publishes deployment jobs to Redis Streams for processing

#### 4. **DeployService**
- Consumes deployment jobs from Redis Streams
- Downloads project files from S3
- Executes build commands (`npm install`, `npm run build`)
- Uploads built static assets back to S3
- Triggers CloudFront invalidation for immediate CDN updates
- Scales automatically based on Redis Streams consumer groups

#### 5. **RequestService**
- Serves deployed applications to end users via CloudFront CDN
- Routes requests to appropriate deployments using unique IDs
- Handles domain mapping and URL routing
- Leverages CloudFront for global content delivery and caching
- Provides low-latency access worldwide

#### 6. **LoggingService**
- Centralized logging for all microservices
- Tracks deployment progress and status in real-time
- Stores build logs, error messages, and system events
- Streams live logs to frontend via WebSockets
- Provides deployment history and analytics

## 🚀 Deployment Flow

1. **Upload Phase**
   - User submits a GitHub repository URL via the frontend
   - CentralAuthService validates user credentials and permissions
   - UploadService clones the repository
   - Project files are uploaded to AWS S3 with a unique deployment ID
   - Deployment job is published to Redis Streams

2. **Build Phase**
   - DeployService consumes the job from Redis Streams
   - Downloads project files from S3
   - Installs dependencies and builds the static site
   - Uploads the production build back to S3
   - Publishes build completion event to Redis Streams

3. **Distribution Phase**
   - CloudFront CDN invalidation triggered for new deployment
   - Static assets are distributed across CloudFront edge locations globally
   - RequestService configures routing for the new deployment

4. **Live Monitoring**
   - LoggingService streams real-time logs to the frontend via WebSockets
   - Users can watch the entire deployment process live
   - Build logs, errors, and status updates appear instantly

5. **Access Phase**
   - Users access their deployed site via CloudFront CDN URL
   - Global edge locations ensure low-latency access worldwide
   - Static files (HTML, CSS, JS) are served with optimal caching

## 🛠️ Technology Stack

### Infrastructure
- **Cloud Provider**: AWS (S3, CloudFront)
- **CDN**: AWS CloudFront for global content delivery
- **Storage**: AWS S3 for static assets and build artifacts
- **Message Queue**: Redis Streams for inter-service communication

### Backend
- **Runtime**: Node.js
- **Language**: JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSockets for live log streaming

### Frontend
- **Framework**: React
- **Styling**: HTML/CSS
- **Real-time Updates**: WebSocket client for live logs

### DevOps
- **Version Control**: GitHub integration
- **Logging**: Custom LoggingService with WebSocket streaming
- **Monitoring**: Real-time deployment tracking

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS account with S3 and CloudFront access
- Redis server (for Redis Streams)
- GitHub account for repository access
- AWS CLI configured with appropriate credentials

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JenilSavalia/vercel-octo-sniffle.git
   cd vercel-octo-sniffle
   ```

2. **Install dependencies for each service**
   ```bash
   # CentralAuthService
   cd CentralAuthService
   npm install

   # UploadService
   cd ../UploadService
   npm install

   # DeployService
   cd ../DeployService
   npm install

   # RequestService
   cd ../RequestService
   npm install

   # LoggingService
   cd ../LoggingService
   npm install

   # Frontend
   cd ../Frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` files in each service directory with the required configuration:
   
   ```env
   # Example .env structure
   PORT=3000
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET=your_bucket_name
   CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
   
   # Redis Streams
   REDIS_URL=redis://localhost:6379
   REDIS_STREAM_NAME=deployment_stream
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=24h
   
   # GitHub Integration
   GITHUB_TOKEN=your_github_token
   
   # WebSocket Configuration
   WS_PORT=8080
   ```

4. **Start the services**
   ```bash
   # Start each service in separate terminals
   cd CentralAuthService && npm start
   cd UploadService && npm start
   cd DeployService && npm start
   cd RequestService && npm start
   cd LoggingService && npm start
   cd Frontend && npm start
   ```

## 🎮 Usage

1. Open the frontend application in your browser
2. Sign in or create an account (managed by CentralAuthService)
3. Enter the GitHub repository URL you want to deploy
4. Click "Deploy" and watch the live logs stream in real-time
5. Monitor the build process through WebSocket-powered live updates
6. Once deployed, access your application at the CloudFront CDN URL
7. Your site is now live globally with edge caching!

## 📊 Key Features

- ✅ **GitHub Integration**: Deploy directly from GitHub repositories
- ✅ **Automatic Builds**: Automated build process with dependency management
- ✅ **Global CDN**: CloudFront CDN distribution for worldwide low-latency access
- ✅ **Live Log Streaming**: Real-time build logs via WebSockets
- ✅ **Redis Streams**: Decoupled microservices architecture with message streams
- ✅ **Central Authentication**: JWT-based centralized auth system across all services
- ✅ **AWS S3 Storage**: Reliable object storage for source code and built assets
- ✅ **Unique Deployment URLs**: Each deployment gets a unique CloudFront URL
- ✅ **Scalable Architecture**: Microservices that scale independently
- ✅ **Real-time Monitoring**: Live deployment status and progress tracking
- ✅ **Continuous Deployment**: Full CD pipeline from commit to production

## 🔮 Future Enhancements

- [ ] Custom domain support with SSL certificates
- [ ] Environment variable management per deployment
- [ ] Rollback to previous deployments
- [ ] Preview deployments for pull requests
- [ ] Analytics dashboard with deployment metrics
- [ ] Multi-framework support (Vue, Angular, Svelte, etc.)
- [ ] Serverless function support at edge locations
- [ ] Automatic HTTPS with Let's Encrypt
- [ ] Team collaboration and access control
- [ ] Build caching for faster deployments
- [ ] Git hooks integration
- [ ] Deployment webhooks and notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This is a production-ready implementation built for learning and demonstration purposes. While it incorporates real AWS infrastructure (S3, CloudFront), Redis Streams, and proper microservices patterns, additional considerations for enterprise production use would include:

- Enhanced security measures and penetration testing
- Comprehensive error handling and retry mechanisms
- Advanced monitoring and alerting (CloudWatch, DataDog)
- Rate limiting and DDoS protection
- Database for persistent deployment metadata
- Backup and disaster recovery strategies
- Cost optimization and resource management
- Compliance and audit logging

The platform demonstrates core concepts of modern deployment systems similar to Vercel/Netlify.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Vercel](https://vercel.com) and [Netlify](https://netlify.com) deployment platforms
- Built with AWS S3 and CloudFront for production-grade infrastructure
- Utilizes Redis Streams for efficient service decoupling
- Implements WebSocket technology for real-time log streaming
- Demonstrates modern microservices architecture and continuous deployment practices

---

## 🌟 Technical Highlights

### Redis Streams Implementation
- Asynchronous job processing with consumer groups
- Fault-tolerant message delivery
- Horizontal scalability for build workers
- Event-driven architecture across services

### Live Log Streaming
- WebSocket connections for real-time updates
- Server-sent events from LoggingService
- Frontend receives instant build progress
- No polling required - push-based updates

### Central Authentication System
- Single source of truth for user identity
- JWT tokens with secure signing
- Inter-service authentication
- Role-based access control (RBAC) ready

### AWS Infrastructure
- S3 for reliable object storage
- CloudFront for global CDN distribution
- Edge locations for low-latency worldwide
- Automatic cache invalidation on deployment

## 📧 Contact

Jenil Savalia - [@JenilSavalia](https://github.com/JenilSavalia)

Project Link: [https://github.com/JenilSavalia/vercel-octo-sniffle](https://github.com/JenilSavalia/vercel-octo-sniffle)

---

⭐ Star this repository if you find it helpful!
