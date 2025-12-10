# 🎓 Sho8la - Student Freelance Platform

> Connecting Egyptian university students with meaningful freelance opportunities

Sho8la is more than just a marketplace. It's a community where verified students turn their skills into real income, and clients find talented young professionals they can trust.

## 📸 Meet Sho8la in Action

![Sho8la Platform](docs/screenshots/home-page.png)

## ✨ Powerful Features Ready to Use

### 🔐 Enterprise-Grade Security
- User registration and login with JWT tokens
- Military-grade password hashing with bcrypt
- Role-based access control (Student/Client/Freelancer)
- Protected routes and secure authorization

### 👥 Professional User Management
- Complete user profiles with full edit capability
- Showcase your hourly rates and skills
- University verification system
- Personalized dashboard for each role

### 💰 Reliable Financial System
- Secure wallet management with real-time balance
- Instant withdrawal request processing
- Multiple safe withdrawal methods (Bank transfer, Mobile wallet)
- Complete transaction history & tracking
- Quick fund addition functionality

### 🚀 Premium User Experience
- Beautiful, modern responsive design with Tailwind CSS
- Lightning-fast Next.js frontend
- Smooth real-time loading states
- Perfect mobile experience on any device

## 🛠️ Tech Stack

**Frontend**: Next.js 14 • TypeScript • React • Tailwind CSS • Lucide Icons  
**Backend**: Express.js • Node.js • REST API • Nodemailer
**Payments**: Paymob Integration (Cards & Mobile Wallets)
**Database**: MongoDB Atlas (Cloud)  
**Authentication**: JWT + bcrypt  
**State Management**: React Context + localStorage

## 📁 Project Structure

```
Sho8la_Project/
├── backend/                          # Express.js server
│   ├── src/
│   │   ├── config/                  # DB & JWT config
│   │   ├── models/                  # MongoDB schemas
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Auth middleware
│   │   └── server.js                # Entry point
│   └── .env                         # MongoDB Atlas URI
│
├── FrontEnd/sho8la/                 # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Pages & routing
│   │   ├── components/              # Reusable components
│   │   ├── contexts/                # AuthContext
│   │   ├── lib/                     # API client & utilities
│   │   └── hooks/                   # Custom React hooks
│   └── package.json
│
├── UML_Diagrams/                    # System design documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier available)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd FrontEnd/sho8la
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Test the Platform
1. Register as a Freelancer or Client
2. Explore the dashboard
3. Try wallet features
4. Test withdrawal requests

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/me` - Get current user

### Wallets
- `GET /api/wallets/:userId` - Get wallet balance
- `POST /api/wallets/add-funds` - Add funds to wallet

### Withdrawals
- `GET /api/withdrawals/user/:userId` - Get withdrawal history
- `POST /api/withdrawals/request` - Request withdrawal
- `GET /api/withdrawals/pending` - Get pending withdrawals (admin)
- `PUT /api/withdrawals/:id/approve` - Approve withdrawal (admin)

## ✅ Production-Ready Features

✅ **Secure Registration & Login** - Fast, reliable authentication  
✅ **Smart Dashboards** - Role-specific views tailored for you  
✅ **Complete Profile Control** - Manage your professional presence  
✅ **Secure Wallet System** - Your money, your control  
✅ **Instant Withdrawals** - Get paid quickly & safely  
✅ **Responsive Design** - Works perfectly on mobile & desktop  
✅ **Enterprise Backend** - Robust, scalable architecture  

✅ **Smart Job System** - Post, browse, and manage jobs efficiently
✅ **Direct Messaging** - Real-time chat for smooth collaboration
✅ **Paymob Integration** - Securely add funds via Card or Mobile Wallet
✅ **Proposal System** - Submit and review detailed project proposals
✅ **Reviews & Ratings** - Build trust with verified feedback

## 🚀 Coming Soon

- 🎓 University ID verification (Enhanced automated checks)
- 📊 Advanced Analytics Dashboard

## 🛡️ Quality Assurance

Sho8la is built with reliability in mind:
- ✅ Thoroughly tested authentication system
- ✅ Accurate wallet & financial calculations
- ✅ Smooth, responsive dashboards
- ✅ Secure role-based access control
- ✅ Comprehensive form validation

Every feature has been tested and verified for your peace of mind.

For detailed development history, see `DEVELOPMENT_LOG.md` (local reference)

## 💻 Development

### Run Development Server
```bash
cd FrontEnd/sho8la
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Backend Development
```bash
cd backend
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- Questions? Check the documentation
- Found a bug? [Open an issue](https://github.com/moazmo/sho8la/issues)
- Want to contribute? [See contributing guide](#contributing)

## 📄 License

MIT License - feel free to fork and use this project

---

**Made with ❤️ by students, for students**  
Sho8la © 2025
