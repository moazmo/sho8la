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

## 📋 Phase 1 Features

✅ User Authentication (Register/Login)  
✅ JWT Token Management  
✅ User Profiles (Create & Update)  
✅ Password Hashing with bcrypt  

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/me` - Get current user

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
{
  email, password (hashed), name, role,
  university, verified, profile { bio, skills, rating, completedJobs },
  createdAt
}
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

## ⚡ Next Steps (Phase 2)
- Job Management CRUD
- Proposal System
- Basic Filtering

---
Made with ❤️ for Sho8la
