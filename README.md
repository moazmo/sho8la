# Sho8la - Student Freelance Platform

A modern platform connecting Egyptian university students with freelance opportunities.

## Overview

Sho8la is a student-to-client freelance marketplace built for verified university students. It provides a secure, trust-based environment where students can showcase their skills and earn income.

## Screenshots

![Sho8la Home Page](docs/screenshots/home-page.png)

## Key Features

- **University ID Verification** - Verify your student status for trust badges
- **Job Marketplace** - Browse and apply for freelance projects
- **Secure Payments** - Escrow-based payment system for protection
- **Trust & Safety** - Verified badges, dispute resolution, and community standards
- **Student Profiles** - Showcase skills, ratings, and completed projects
- **Real-time Chat** - Communicate directly with clients

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React, Tailwind CSS
- **Design**: Lucide React Icons
- **Architecture**: Component-based with custom hooks and utilities

## Project Structure

```
├── FrontEnd/sho8la/          # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js pages and layouts
│   │   ├── components/       # Reusable React components
│   │   ├── contexts/         # React contexts (Auth, etc.)
│   │   └── lib/              # Utilities and helpers
│   ├── public/               # Static assets
│   └── package.json
├── Activity_Diagrams/        # UML activity diagrams
├── Sequence_Diagrams/        # UML sequence diagrams
├── Class_Diagram/            # UML class diagram
├── DFD_0/ & DFD_1/          # Data flow diagrams
└── Use_case_Diagram/         # Use case diagram
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd FrontEnd/sho8la
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Pages

- **Home** (`/`) - Landing page
- **Browse Jobs** (`/jobs`) - Job marketplace
- **Post Job** (`/post-job`) - Create new job posting
- **Profile** (`/profile`) - User profile
- **Verify ID** (`/verify`) - University ID verification
- **Help** (`/help`) - FAQ and support
- **Trust & Safety** (`/trust-safety`) - Safety policies

## Supported Universities

- Cairo University
- Ain Shams University
- AUC (American University in Cairo)
- GUC (German University in Cairo)
- FCAI (Faculty of Computers and Artificial Intelligence)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This is a student project. Feel free to fork and submit pull requests.

## License

MIT License

## Contact

For questions or support, please contact the development team.
