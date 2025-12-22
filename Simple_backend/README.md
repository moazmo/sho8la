# Sho8la Simple Backend

Minimal Node.js + Express API for the Simple Frontend.

## Quick Start

```bash
cd Simple_backend
npm install
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

### Auth

- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/register` - Register (email, password, name, role)

### Jobs

- `GET /api/jobs` - Get open jobs
- `GET /api/jobs/my/:clientId` - Get client's jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job

### Proposals

- `GET /api/proposals/freelancer/:id` - Get freelancer's proposals
- `GET /api/proposals/job/:id` - Get proposals for job
- `POST /api/proposals` - Submit proposal
- `PATCH /api/proposals/:id` - Update status

### Verifications

- `GET /api/verifications/user/:id` - Get user's verification
- `GET /api/verifications/pending` - Get pending (admin)
- `POST /api/verifications` - Submit verification
- `PATCH /api/verifications/:id` - Approve/reject

### Wallet

- `GET /api/wallet/:userId` - Get wallet
- `POST /api/wallet/:userId/transaction` - Add transaction

### Messages

- `GET /api/messages/:userId` - Get user's messages
- `POST /api/messages` - Send message

### Reviews

- `GET /api/reviews/freelancer/:id` - Get freelancer reviews
- `POST /api/reviews` - Submit review

### Stats

- `GET /api/stats` - Dashboard stats (admin)

## Data Storage

Data is stored in `data.json` - no database required.

## Admin Credentials

- Email: `admin@sho8la.com`
- Password: `demo_password_123`
