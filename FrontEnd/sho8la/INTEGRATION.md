# Frontend-Backend Integration Guide

## 🔗 Integration Complete

The frontend is now integrated with the backend API.

## 📂 New Files Added

### API Client Layer
- `src/lib/api.ts` - Base API client with token management
- `src/lib/apiAuth.ts` - Authentication endpoints
- `src/lib/apiServices.ts` - All API service modules (jobs, proposals, reviews, messages, verifications, payments, wallets)
- `src/hooks/useApi.ts` - React hooks for API operations
- `.env.local` - Environment configuration

### Updated Files
- `src/contexts/AuthContext.tsx` - Now uses backend API for auth
- `next.config.ts` - API proxy configuration

## 🚀 Setup Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Update .env with your MongoDB URI
```

### 3. Start Backend Server
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm run dev
# Backend runs at http://localhost:5000
```

### 4. Update Frontend API URL (if needed)
Edit `FrontEnd/sho8la/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5. Start Frontend
```bash
cd FrontEnd/sho8la
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

## 📋 API Integration Points

### Authentication
- Login/Register now call backend `/api/auth/*`
- JWT tokens stored in localStorage
- Automatic token injection in all requests

### Jobs Management
- `useJobs()` hook for job operations
- Fetches real data from backend
- CRUD operations fully integrated

### Proposals
- `useProposals()` hook
- Submit, accept, reject proposals
- Real-time proposal management

### Reviews & Ratings
- `useReviews()` hook
- Create reviews with ratings
- Auto-calculated user ratings

### Messaging
- `useMessages()` hook
- Send messages, read status tracking
- Conversation grouping

### Wallet & Payments
- `useWallet()` hook for wallet operations
- Payment processing integration
- Transaction history

### Verification
- University ID verification
- Admin approval workflow
- Auto-verification badge update

## 🔄 Usage Examples

### Login with Backend
```typescript
const { login } = useAuth();
await login('user@example.com', 'password');
```

### Fetch Jobs from Backend
```typescript
const { getJobs } = useJobs();
const jobs = await getJobs({ category: 'web', status: 'open' });
```

### Submit Proposal
```typescript
const { submit } = useProposals();
await submit({
  jobId: '...',
  bidAmount: 500,
  deliveryDays: 14,
  coverLetter: '...'
});
```

### Send Message
```typescript
const { send } = useMessages();
await send({
  conversationId: '...',
  receiverId: '...',
  text: 'Hello!'
});
```

### Process Payment
```typescript
const payment = await paymentsApi.create({
  jobId: '...',
  freelancerId: '...',
  amount: 500
});
await paymentsApi.complete(payment.id);
```

## 🔐 Security Notes

- JWT tokens stored in localStorage
- Tokens automatically sent with all requests
- Backend validates all tokens
- CORS enabled on backend
- Password hashing with bcrypt

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check .env.local has correct API_URL
- Verify CORS enabled in backend (it is by default)

### 401 Unauthorized
- Clear localStorage and re-login
- Check token isn't expired (7 day expiry)
- Verify backend has correct JWT_SECRET

### Connection Refused
- Verify backend server is running
- Check MongoDB is running locally
- Verify ports: Backend (5000), Frontend (3000), MongoDB (27017)

## 📚 API Documentation

See `backend/README.md` for complete API documentation.

---

**Integration Status: ✅ Complete**  
Frontend and Backend fully integrated and ready for production.
