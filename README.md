# Vercel Deployment Clone 🚀

A simplified clone of Vercel's deployment platform built with a microservices architecture. This project demonstrates how modern deployment platforms work by implementing key features like GitHub repository deployment, build automation, and serverless hosting.

## 🎯 Overview

This project recreates the core functionality of Vercel's deployment workflow, allowing users to deploy their web applications by simply providing a GitHub repository URL. The system automatically handles cloning, building, and serving the application.

## 🏗️ Architecture

The project follows a microservices architecture with the following components:

```
┌─────────────┐
│   Frontend  │ (User Interface)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  CentralAuthService │ (Authentication & Authorization)
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌─────────────┐
│ Upload  │  │   Request   │
│ Service │  │   Service   │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────┐  ┌─────────────┐
│  Queue  │  │   Deploy    │
│ (Redis/ │  │   Service   │
│  SQS)   │  │             │
└────┬────┘  └──────┬──────┘
     │              │
     └──────┬───────┘
            ▼
     ┌─────────────┐
     │   Logging   │
     │   Service   │
     └─────────────┘
```

### Services

#### 1. **Frontend**
- User interface for interacting with the deployment platform
- Submit GitHub repository URLs
- View deployment status and logs
- Access deployed applications

#### 2. **CentralAuthService**
- Handles user authentication and authorization
- Manages API keys and access tokens
- Validates user permissions for deployments

#### 3. **UploadService**
- Receives GitHub repository URLs from users
- Clones projects from GitHub
- Generates unique deployment IDs
- Uploads project files to object storage (S3/MinIO)
- Pushes deployment IDs to a queue for processing

#### 4. **DeployService**
- Retrieves deployment IDs from the queue
- Downloads project files from object storage
- Executes build commands (`npm install`, `npm run build`)
- Uploads built assets back to object storage
- Scales automatically based on queue depth

#### 5. **RequestService**
- Serves deployed applications to end users
- Routes requests to appropriate deployments using unique IDs
- Fetches and serves static assets from object storage
- Handles domain mapping (e.g., `dist<id>.domain.com`)

#### 6. **LoggingService**
- Centralized logging for all services
- Tracks deployment progress and status
- Stores build logs and error messages
- Provides real-time log streaming

## 🚀 Deployment Flow

1. **Upload Phase**
   - User submits a GitHub repository URL via the frontend
   - UploadService clones the repository
   - Project is uploaded to S3 with a unique ID
   - Deployment ID is added to the processing queue

2. **Build Phase**
   - DeployService picks up the deployment ID from the queue
   - Downloads project files from S3
   - Installs dependencies and builds the project
   - Uploads the production build back to S3

3. **Request Phase**
   - Users access their deployed site via `dist<id>.domain.com`
   - RequestService fetches the build from S3
   - Static files (HTML, CSS, JS) are served to the user

## 🛠️ Technology Stack

- **Backend**: Node.js / JavaScript
- **Frontend**: React/HTML/CSS
- **Object Storage**: AWS S3 / MinIO
- **Queue**: Redis / AWS SQS
- **Authentication**: JWT / OAuth
- **Logging**: Winston / Custom logging service

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS account or MinIO setup
- Redis server or AWS SQS
- GitHub account for repository access

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
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET=your_bucket_name
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   GITHUB_TOKEN=your_github_token
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
2. Sign in or create an account
3. Enter the GitHub repository URL you want to deploy
4. Click "Deploy" and wait for the build process to complete
5. Once deployed, access your application at the provided URL

## 📊 Features

- ✅ GitHub repository deployment
- ✅ Automatic build process
- ✅ Unique deployment URLs
- ✅ Real-time build logs
- ✅ Scalable microservices architecture
- ✅ Object storage for project files
- ✅ Queue-based job processing
- ✅ Centralized authentication
- ✅ Logging and monitoring

## 🔮 Future Enhancements

- [ ] Custom domain support
- [ ] Environment variable management
- [ ] Rollback to previous deployments
- [ ] Preview deployments for pull requests
- [ ] Analytics and monitoring dashboard
- [ ] Multi-framework support (currently focused on React)
- [ ] Serverless function support
- [ ] Edge network distribution
- [ ] Team collaboration features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This is an educational project created to understand how deployment platforms like Vercel work. It is a simplified version and does not include production-level considerations such as:
- Advanced security measures
- High availability and fault tolerance
- Performance optimizations
- Complete error handling
- Rate limiting and DDoS protection

This project should not be used in production environments without significant enhancements.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Vercel](https://vercel.com)'s deployment platform
- Built for learning purposes to understand microservices architecture
- Thanks to the open-source community for various tools and libraries

## 📧 Contact

Jenil Savalia - [@JenilSavalia](https://github.com/JenilSavalia)

Project Link: [https://github.com/JenilSavalia/vercel-octo-sniffle](https://github.com/JenilSavalia/vercel-octo-sniffle)

---

⭐ Star this repository if you find it helpful!
