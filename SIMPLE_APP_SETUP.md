# Sho8la Simple Web App

A complete freelance platform simulation for Egyptian university students. This is a standalone demo that works **100% offline** with no database required.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **A modern web browser** (Chrome, Edge, Firefox)

To check if Node.js is installed:
```bash
node --version
npm --version
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/moazmo/sho8la.git
cd sho8la
```

Or download the ZIP from GitHub and extract it.

### Step 2: Install Backend Dependencies

```bash
cd Simple_backend
npm install
```

This installs Express.js and CORS (the only dependencies).

### Step 3: Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 Sho8la API running at http://localhost:3000
```

**Keep this terminal open!** The server must stay running.

### Step 4: Open the Frontend

Open a new terminal/file explorer and:

**Option A: Double-click the file**
Navigate to `Simple_frontend/index.html` and double-click to open in browser.

**Option B: Use the full path in browser**
```
file:///C:/path/to/sho8la/Simple_frontend/index.html
```

**Option C: Use VS Code Live Server**
If you have the Live Server extension, right-click `index.html` → "Open with Live Server"

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sho8la.com | admin123 |
| **Freelancer** | Any email you create | Any password |
| **Client** | Any email you create | Any password |

You can create new accounts by clicking "Sign Up".

---

## 👥 Demo: Testing Two Accounts Side by Side

To demonstrate the chat and job flow between a client and freelancer:

### Method 1: Normal + Incognito Window (Recommended)

1. **Window 1** (Normal browser):
   - Open `index.html`
   - Sign up/login as **Client**

2. **Window 2** (Incognito/Private window):
   - Press `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Edge/Firefox)
   - Open the same `index.html` file
   - Sign up/login as **Freelancer**

3. Arrange windows side by side to demo the interaction.

### Method 2: Two Different Browsers

1. Open in **Chrome** → Login as Client
2. Open in **Edge** → Login as Freelancer

---

## 🎬 Demo Flow (Recommended Sequence)

| Step | Client Does | Freelancer Does |
|------|-------------|-----------------|
| 1 | Sign up as Client | Sign up as Freelancer |
| 2 | Add funds to wallet (Wallet → Add Funds) | - |
| 3 | Post a new job | Browse jobs, see the new job |
| 4 | - | Submit a proposal |
| 5 | View proposal in "My Jobs" | Wait for response |
| 6 | Accept the proposal | See "Accepted" status |
| 7 | Click "💬 Chat" | Click "💬 Chat" on proposals page |
| 8 | Send a message | See message appear |
| 9 | Reply to each other | Messages update every 3 seconds |
| 10 | Click "✓ Complete" (confirms payment) | - |
| 11 | Check Wallet (money deducted) | Check Wallet (money received!) |
| 12 | Leave a review | See rating on Profile |

---

## 📁 Project Structure

```
sho8la/
├── Simple_backend/
│   ├── server.js        # Express.js API server (~230 lines)
│   ├── data.json        # JSON file database (auto-updated)
│   ├── package.json     # Dependencies
│   └── README.md        # API documentation
│
├── Simple_frontend/
│   ├── index.html       # Single-page application
│   ├── script.js        # All frontend logic (~320 lines)
│   └── styles.css       # All styling
│
└── SIMPLE_APP_SETUP.md  # This file
```

---

## 🔧 API Endpoints

The backend runs at `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login user |
| POST | /auth/register | Register new user |
| GET | /jobs | Get all open jobs |
| POST | /jobs | Create new job |
| PATCH | /jobs/:id | Update job (includes payment transfer on completion) |
| GET | /proposals | Get all proposals |
| POST | /proposals | Submit proposal |
| PATCH | /proposals/:id | Accept/reject proposal |
| GET | /messages/:userId | Get user's messages |
| POST | /messages | Send message |
| GET | /wallet/:userId | Get wallet balance |
| POST | /wallet/:userId/transaction | Add/withdraw funds |
| GET | /verifications/pending | Get pending verifications (admin) |
| PATCH | /verifications/:id | Approve/reject verification |

---

## ⚡ Features Implemented

### For Freelancers
- ✅ Browse and search jobs
- ✅ Submit proposals with bid amount
- ✅ Real-time chat with clients
- ✅ University ID verification
- ✅ Wallet with earnings tracking
- ✅ Profile with ratings

### For Clients
- ✅ Post jobs with budget and skills
- ✅ Review and accept proposals
- ✅ Real-time chat with freelancers
- ✅ Complete jobs with automatic payment
- ✅ Leave reviews for freelancers
- ✅ Add funds to wallet

### For Admin
- ✅ Dashboard with platform stats
- ✅ Approve/reject student verifications

---

## 🛠️ Troubleshooting

### "Cannot connect to API" or "API Error"
- Make sure the backend is running (`npm start` in Simple_backend)
- Check that port 3000 is not in use by another application

### "CORS Error"
- The backend includes CORS headers. If issues persist, use a proper HTTP server for the frontend instead of file://

### Using Live Server (VS Code)
If using VS Code Live Server extension, update `API_URL` in `script.js`:
```javascript
var API_URL = 'http://localhost:3000/api';  // Keep as is
```

### Resetting Data
To start fresh, replace `data.json` content with:
```json
{
  "users": [{"id":"admin","name":"Admin","email":"admin@sho8la.com","password":"admin123","role":"admin"}],
  "jobs": [],
  "proposals": [],
  "verifications": [],
  "wallets": {},
  "messages": [],
  "reviews": []
}
```

---

## 📝 Notes for Presentation

1. **Offline Ready**: Everything runs locally, no internet needed
2. **No Database**: Uses JSON file, data persists between restarts
3. **Real-time Chat**: Messages refresh every 3 seconds
4. **Payment System**: Automatic transfer when job is completed
5. **Clean Code**: ~550 lines total (backend + frontend JS)

---

## 📄 License

This project is for educational purposes - Faculty of Computers and AI, Helwan University (FCAIH).

---

**Made with ❤️ by Moaz**
