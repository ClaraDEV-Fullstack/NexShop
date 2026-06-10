# 🛒 NEXSHOP

A modern, full-stack e-commerce platform built for the Cameroon market — featuring a responsive **React** frontend and a **Django REST Framework** backend. Browse products, manage cart & wishlist, checkout with mobile money (demo mode), track orders, and receive email confirmations.

| | |
|---|---|
| **Live demo** | [nextshop-ui.onrender.com](https://nextshop-ui.onrender.com) |
| **API** | [nexshop-shur.onrender.com/api](https://nexshop-shur.onrender.com/api) |
| **Repository** | [github.com/ClaraDEV-Fullstack/NexShop](https://github.com/ClaraDEV-Fullstack/NexShop) |

> ⚠️ **Note:** Free Render instances sleep after ~15 min idle. The UI loads from a static CDN; the API may take up to ~60s to wake on first visit.

<p align="center">
  <img width="90%" alt="NEXSHOP Landing Page" src="https://github.com/user-attachments/assets/1dcfcdb6-47bb-4a6b-b5d7-19a1c5684ad3" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Django-6.0-092E20?logo=django&style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&style=for-the-badge" />
</p>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📸 Screenshots](#-screenshots)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation](#-installation)
- [🌐 Deploy on Render](#-deploy-on-render)
- [📚 API Documentation](#-api-documentation)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 🛍️ Shopping
- Product catalog with categories, filters, sorting, and pagination
- Smart search and product detail pages with image galleries
- Related products, featured sections, and bestseller collections
- FCFA pricing tailored for the Cameroon market

### 👤 Authentication & Account
- JWT login / register with **Google OAuth 2.0**
- User profile and settings
- Protected routes for checkout and dashboard pages
- Personal dashboard: orders, wishlist, notifications, settings

### 🛒 Cart, Checkout & Orders
- Persistent shopping cart (Redux Toolkit)
- Multi-step checkout with shipping details
- Order history, order detail, and cancellation
- Wishlist (save for later)

### 💳 Payments
- **Orange Money** and **MTN Mobile Money** checkout UI
- Demo mode (`PAYMENT_MODE=mock`) for portfolio — no real charges
- Production-ready **CinetPay** integration for live payments

### ⭐ Engagement
- Product reviews and star ratings
- In-app notifications dashboard
- Order & payment confirmation emails via **Brevo SMTP**
- Toast alerts and animated payment success feedback

### 🚀 Production
- Dockerized backend with Gunicorn
- Static React frontend on Render CDN (Vite build)
- Product images served from **Supabase Storage**
- Auto-seed catalog on empty production database
- Open Graph meta tags for rich link previews (WhatsApp, LinkedIn)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite 6** | Build tool & dev server |
| **Redux Toolkit** | Auth, cart & global state |
| **React Router v6** | Routing & protected routes |
| **Tailwind CSS** | Responsive UI & dark mode |
| **Framer Motion** | Animations |
| **Axios** | API client |
| **@react-oauth/google** | Google Sign-In |
| **React Hot Toast** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 6** | Web framework |
| **Django REST Framework** | REST API |
| **SimpleJWT** | Token authentication |
| **PostgreSQL** | Database |
| **django-filter** | Product filtering |
| **drf-spectacular** | OpenAPI / Swagger docs |
| **Gunicorn + WhiteNoise** | Production server |

### Infrastructure & Integrations
| Technology | Purpose |
|------------|---------|
| **Docker** | Backend containerization |
| **Render** | Hosting (API + static frontend) |
| **Supabase Storage** | Product media CDN |
| **Brevo (SMTP)** | Transactional emails |
| **CinetPay** | Mobile money payments (live mode) |
| **Google OAuth 2.0** | Social login |

---

## 📸 Screenshots

### User Dashboard
<p align="center">
  <img width="90%" alt="NEXSHOP Dashboard" src="https://github.com/user-attachments/assets/8abcca37-b766-4c70-be11-a8b6e8b83845" />
</p>

---

## 📁 Project Structure

```text
NexShop/
├── backend/                  # Django REST API
│   ├── accounts/             # Auth, profiles, Google OAuth
│   ├── products/             # Catalog, categories, images
│   ├── cart/                 # Server-side cart logic
│   ├── orders/               # Order processing & emails
│   ├── payments/             # Mobile money / CinetPay
│   ├── reviews/              # Ratings & feedback
│   ├── wishlist/             # Saved products
│   ├── alerts/               # User notifications
│   └── nexshop/              # Settings, URLs, storage
├── frontend/                 # React SPA (Vite)
│   ├── public/               # Static assets, og-image, _redirects
│   └── src/
│       ├── api/                # Axios client & endpoints
│       ├── store/              # Redux slices (auth, cart)
│       ├── pages/              # Route pages
│       └── components/         # Reusable UI
├── Dockerfile                # Render backend image
├── docker-compose.yml        # Local full-stack dev
├── render.yaml               # Render Blueprint
└── nginx/                    # Reverse proxy (local/prod)
```

---

## 🚀 Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL (or Docker)

### 1. Clone the repository

```bash
git clone https://github.com/ClaraDEV-Fullstack/NexShop.git
cd NexShop
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env        # Edit with your values
python manage.py migrate
python manage.py runserver
```

API runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local        # Set VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm run dev
```

App runs at `http://localhost:5173`

### 4. Docker (optional)

```bash
docker-compose up --build
```

---

## 🌐 Deploy on Render

1. Push to GitHub, then in [Render](https://render.com) → **New → Blueprint** → select this repo (`render.yaml` is included).
2. Fill secret env vars after the blueprint is applied (see `.env.render.example` for the full list).

| Service | Variable | Example |
|---------|----------|---------|
| **nexshop-api (backend)** | `ALLOWED_HOSTS` | `nexshop-shur.onrender.com` |
| | `BACKEND_URL` | `https://nexshop-shur.onrender.com` |
| | `FRONTEND_URL` | `https://nextshop-ui.onrender.com` |
| | `CORS_ALLOWED_ORIGINS` | `https://nextshop-ui.onrender.com` |
| | `CSRF_TRUSTED_ORIGINS` | `https://nextshop-ui.onrender.com,https://nexshop-shur.onrender.com` |
| | `PAYMENT_MODE` | `mock` |
| | `GOOGLE_OAUTH_CLIENT_ID` | *(Google Cloud Console)* |
| | `GOOGLE_OAUTH_CLIENT_SECRET` | *(Google Cloud Console)* |
| **nextshop-ui (frontend)** | `VITE_API_URL` | `https://nexshop-shur.onrender.com/api` |
| | `VITE_GOOGLE_CLIENT_ID` | *(same Client ID as backend)* |

3. Frontend is deployed as a **Static Site** (CDN-cached Vite build).
4. Optional: ping `https://nexshop-shur.onrender.com/api/health/` with [UptimeRobot](https://uptimerobot.com) every 5 minutes to reduce cold starts.

### Empty database / images on Render free tier

Render free Web Services have **no Shell**. Product images are served from **Supabase CDN**.

Add to the **backend** environment:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=<service_role key>
SUPABASE_BUCKET=media
AUTO_SEED_DB=true
```

Redeploy — the backend auto-seeds products and uploads images in the background (~5–10 min). Watch logs for `AUTO_SEED_DB: seeding finished.`

### Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/), add authorized origins:

- `https://nextshop-ui.onrender.com`

---

## 📚 API Documentation

Interactive Swagger UI (when backend is running):

| | URL |
|---|---|
| **Swagger UI** | `http://localhost:8000/api/docs/` |
| **OpenAPI schema** | `http://localhost:8000/api/schema/` |
| **Health check** | `https://nexshop-shur.onrender.com/api/health/` |

---

## 👨‍💻 Author

**Clara Beri** — [ClaraDEV-Fullstack](https://github.com/ClaraDEV-Fullstack)

- GitHub: [@ClaraDEV-Fullstack](https://github.com/ClaraDEV-Fullstack)
- LinkedIn: [Clara Beri](https://linkedin.com/in/clara-beri-794097217/)
- Portfolio: [claradev.vercel.app](https://claradev.vercel.app)

<p align="center">Built with ❤️ in Cameroon 🇨🇲</p>
