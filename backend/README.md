🎓 **Sho8la Backend** - Phase 1 (Core Infrastructure)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sho8la
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
```

Server starts at `http://localhost:5000`

## 📋 Phase 1-2 Features

✅ User Authentication (Register/Login)  
✅ JWT Token Management  
✅ User Profiles (Create & Update)  
✅ Password Hashing with bcrypt  
✅ Job Management (CRUD)  
✅ Proposal System (Submit, Accept, Reject)  
✅ Job Filtering & Search  

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (filters: category, status, search)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (auth required)
- `PUT /api/jobs/:id` - Update job (auth required, client only)
- `DELETE /api/jobs/:id` - Delete job (auth required, client only)

### Proposals
- `GET /api/proposals/job/:jobId` - Get proposals for a job
- `GET /api/proposals/user/:userId` - Get user's proposals
- `POST /api/proposals` - Submit proposal (auth required)
- `PUT /api/proposals/:id/accept` - Accept proposal (auth required, client only)
- `PUT /api/proposals/:id/reject` - Reject proposal (auth required, client only)

### Health
- `GET /api/health` - Check server status

## 🔐 Authentication

Include JWT token in requests:
```
Authorization: Bearer <token>
```

## 📊 Data Models

**User Schema:**
```javascript
{ email, password (hashed), name, role, university, verified, 
  profile { bio, skills, rating, completedJobs }, createdAt }
```

**Job Schema:**
```javascript
{ title, description, budget, category, skills[], clientId, 
  freelancerId, status, createdAt, updatedAt }
```

**Proposal Schema:**
```javascript
{ jobId, freelancerId, bidAmount, deliveryDays, 
  coverLetter, status, createdAt }
```

## 🛠️ Project Structure
```
src/
├── config/     # DB & JWT config
├── models/     # Mongoose schemas
├── routes/     # API endpoints
├── middleware/ # Auth middleware
└── server.js   # Entry point
```

## ⚡ Next Steps (Phase 3)
- Messaging System
- Reviews & Ratings
- Verification System

---
Made with ❤️ for Sho8la
