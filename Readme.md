<div align="center">

![Crux Cover](https://itzrealashwin.vercel.app/cover/crux.png)

# Crux

### Campus Placement Intelligence Platform

*Bridging the gap between students and opportunities — one streamlined placement workflow at a time*

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](#)

[Features](#-core-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 🎯 What is Crux?

Crux is a **centralized campus placement management platform** built for engineering colleges and universities. It connects students, Training & Placement Officers (TPOs), and recruiters in one unified system — eliminating manual coordination, spreadsheet chaos, and missed opportunities.

GitHub gives you repos. Jira gives you tasks. **Crux gives your placement cell a backbone.**

### The Problem We Solve

- ❌ Students applying to drives through emails and forms
- ❌ TPOs manually screening hundreds of applications
- ❌ No real-time visibility into application status
- ❌ Recruiters struggling to filter candidates by skills
- ❌ No central analytics for department-wise placement performance

### The Solution

- ✅ Single streamlined workflow for student applications
- ✅ Automated eligibility checks reducing manual screening
- ✅ Real-time application tracking for students
- ✅ Skill-based candidate filtering for recruiters
- ✅ Analytics dashboards for placement insights

---

## ✨ Core Features

### 🎓 **Student Experience**
Students build professional academic and technical profiles and discover internships, PPOs, and full-time opportunities through advanced search and filtering. Apply with a single streamlined workflow and track application progress in real time.

### 📥 **Smart Application Management**
Automatic eligibility checks reduce manual screening efforts. Students receive instant updates for shortlist and interview rounds, while centralized notifications keep them informed about every activity on the platform.

### 🏢 **Recruiter Tools**
Recruiters manage placement drives with structured hiring stages and define custom eligibility criteria for every drive. Skill-based filtering helps companies identify suitable candidates faster without sifting through irrelevant profiles.

### 📊 **TPO Dashboard**
TPOs review and manage applications from a centralized dashboard and monitor department-wise placement insights and statistics. Placement teams manage internships, PPOs, and full-time opportunities together in one place.

### 🔐 **Role-Based Access Control**
Secure role-based access ensures controlled platform management across Students, TPOs, Admins, and Recruiters — each with clearly scoped permissions and responsibilities.

### 📈 **Analytics & Insights**
Admins monitor placement performance through analytics dashboards. Track offer rates, company-wise hiring trends, department statistics, and overall placement health at a glance.

---

## 🚀 Quick Start

### Prerequisites

```bash
node -v     # v18+ (LTS recommended)
npm -v      # v9+
mongod      # MongoDB 6+
```

### Installation

**1️⃣ Clone the repo**

```bash
git clone https://github.com/itzrealashwin/Crux.git
cd Crux
```

**2️⃣ Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Setup below)

# Start the server
npm run dev
```

**3️⃣ Frontend Setup**

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your backend URL

# Start the dev server
npm run dev
```

**4️⃣ Access the app**

```
🎉 Frontend: http://localhost:3000
🔧 Backend:  http://localhost:5000
```

---

## 🔐 Environment Setup

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/mes_placement

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_change_this
JWT_REFRESH_SECRET=your_refresh_secret_change_this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10

# CORS
CLIENT_URL=https://admin.example.com,https://app.example.com

# You can add as many allowed origins as you need, separated by commas.
# Local development on http://localhost:5173 is still allowed automatically.

# Logging
LOG_LEVEL=dev

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

> 💡 **Pro Tip**: Never commit `.env` files. Use strong, randomly generated secrets for production.

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- ⚛️ React 18 + Vite
- 🎨 Tailwind CSS
- 🔄 TanStack Query (React Query)
- 🧭 React Router v6

**Backend**
- 🟢 Node.js + Express
- 🍃 MongoDB + Mongoose
- 🔐 JWT Authentication (Access + Refresh tokens)
- 📧 Nodemailer (Email notifications)

---

## 📁 Project Structure

```
CRUX/
├── backend/
│   ├── postman/                  # Postman collections for API testing
│   └── src/
│       ├── config/               # Database & service configs
│       ├── controllers/          # Route controllers
│       ├── middlewares/          # Auth, validation, error handling
│       ├── models/               # Mongoose models
│       ├── routes/               # API endpoints
│       ├── services/             # Business logic layer
│       ├── store/                # In-memory or session store utilities
│       ├── utils/                # Helper functions
│       └── index.js              # Express app entry
│
├── frontend/
│   ├── public/                   # Static assets
│   └── src/
│       ├── app/                  # App-level setup (router, providers, layouts)
│       ├── assets/               # Images, icons, fonts
│       ├── features/             # Feature-based modules (see below)
│       │   ├── admin/
│       │   │   ├── api/          # API service files (e.g. admin.service.js, dashboard.service.js)
│       │   │   ├── components/   # Feature-specific components
│       │   │   ├── hooks/        # Feature-specific hooks
│       │   │   └── pages/        # Feature-specific pages
│       │   ├── applications/     # Applications feature module
│       │   └── auth/             # Auth feature module
│       ├── lib/                  # Third-party integrations & configs
│       ├── shared/               # Shared components, hooks, utilities
│       ├── widgets/              # Standalone reusable UI widgets
│       └── main.jsx              # React entry point
│
├── .gitignore
└── README.md
```

### Key Directories Explained

| Directory | Purpose |
|-----------|---------|
| `backend/src/controllers/` | HTTP request handlers — thin layer that delegates to services |
| `backend/src/services/` | Business logic — eligibility checks, filtering, notifications |
| `backend/src/middlewares/` | Auth guards, role checks, error handlers |
| `backend/src/models/` | Mongoose schemas for Users, Drives, Applications, etc. |
| `backend/src/store/` | In-memory store or session utilities |
| `frontend/src/features/` | Feature-based modules; each owns its API, components, hooks, and pages |
| `frontend/src/shared/` | Cross-feature reusable components, hooks, and utilities |
| `frontend/src/widgets/` | Standalone UI widgets used across features |
| `frontend/src/lib/` | Third-party library configs (axios instance, query client, etc.) |

---

## 🗄️ Database Schema

Crux uses Mongoose with MongoDB. Key models include:

- **User** — Authentication, profile, and role management
- **Student** — Academic profile, CGPA, skills, and placement eligibility
- **Recruiter** — Company profile and drive management
- **PlacementDrive** — Job/internship drives with eligibility criteria and hiring stages
- **Application** — Student applications with real-time status tracking
- **Notification** — Centralized notification system for all activities
- **Analytics** — Placement statistics aggregated by department and batch

---

## 🛠️ Available Scripts

### Backend

```bash
npm run dev      # Start dev server with nodemon
npm start        # Production server
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Student** | Profile management, drive discovery, application tracking, notifications |
| **TPO** | Application review, drive oversight, department analytics |
| **Recruiter** | Drive creation, eligibility criteria definition, candidate shortlisting |
| **Admin** | Full platform access, user management, placement analytics |

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Single institution per deployment
- No mobile app (yet)
- Basic analytics (advanced charts coming soon)

### Roadmap
- [ ] Multi-institution support
- [ ] AI-powered candidate matching
- [ ] Resume builder & parser
- [ ] Interview scheduling & calendar integration
- [ ] Slack/WhatsApp notifications
- [ ] Mobile apps (iOS/Android)
- [ ] Offer letter management

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code structure and naming conventions
- Write meaningful commit messages
- Test your changes locally before submitting
- Update documentation if adding new features

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ashwin Mali**

- Portfolio: [itzrealashwin.vercel.app](https://itzrealashwin.vercel.app)
- GitHub: [@itzrealashwin](https://github.com/itzrealashwin)

---

## ⭐ Show Your Support

If Crux helped streamline your placement cell, give it a ⭐️ on GitHub!

---

<div align="center">

**Built with 💙 for students who deserve better than a Google Form**

[Report Bug](https://github.com/itzrealashwin/Crux/issues) • [Request Feature](https://github.com/itzrealashwin/Crux/issues)

</div>