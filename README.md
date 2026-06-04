# 🛒 NextShopSphere

A modern, full-stack e-commerce ecosystem featuring a responsive **React** frontend and a robust **Django REST Framework** backend. This project showcases end-to-end development, from secure JWT/OAuth authentication to containerized deployment.

**🚀 [Live Demo](https://nextshopsphere-ui.onrender.com/)**
⚠️ Note: This project is hosted on a free instance. Please allow up to 1 minute for the initial load as the server wakes up.


<p align="center">
  <img width="90%" alt="NextShopSphere Landing Page" src="https://github.com/user-attachments/assets/1dcfcdb6-47bb-4a6b-b5d7-19a1c5684ad3" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Django-5.1.4-092E20?logo=django&style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux&style=for-the-badge" />
</p>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📸 Screenshots](#-screenshots)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation](#-installation)
- [📚 API Documentation](#-api-documentation)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 🛍️ Shopping Experience
- **Dynamic Catalog:** Product browsing with advanced categories and filtering.
- **Smart Search:** Real-time search functionality for products.
- **Rich Galleries:** Interactive image galleries for product details.
- **Recommendations:** Related products and curated bestseller collections.

### 👤 User & Security
- **Secure Auth:** JWT-based login and **Google OAuth 2.0** integration.
- **Profile Management:** User-specific dashboards with profile picture uploads.
- **Protected Routes:** Secure checkout and account management.

### 🛒 Cart & Orders
- **Full Cart Logic:** Persistent shopping cart managed via Redux.
- **Order Lifecycle:** Placement, history tracking, and cancellation capabilities.
- **Wishlist:** Personal "save for later" functionality.

### ⭐ Engagement
- **Reviews & Ratings:** Comprehensive feedback system with statistical summaries.
- **Notifications:** Dashboard alerts and user feedback via **React Hot Toast**.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Core UI Library |
| **Redux Toolkit** | 2.11.1 | State & Cart Management |
| **React Router** | 6.22.0 | Client-side Navigation |
| **Axios** | 1.13.2 | API Communication |
| **Tailwind CSS** | 3.4.18 | Responsive UI & Styling |
| **Framer Motion** | 10.18.0 | High-quality UI Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Django** | 5.1.4 | Robust Web Framework |
| **Django REST Framework** | 3.15.2 | RESTful API Architecture |
| **SimpleJWT** | 5.4.0 | Token-based Authentication |
| **PostgreSQL** | 16 | Relational Database |
| **Docker** | Latest | Containerization & Orchestration |

---

## 📸 Screenshots

### 📊 Admin Dashboard
*Effortless management of products, orders, and user analytics.*
<p align="center">
  <img width="90%" alt="Dashboard" src="https://github.com/user-attachments/assets/8abcca37-b766-4c70-be11-a8b6e8b83845" />
</p>

---

## 📁 Project Structure

```text
NextShopSphere/
├── backend/               # Django REST Framework
│   ├── accounts/          # User Auth & Google OAuth
│   ├── products/          # Catalog Management
│   ├── orders/            # Order Processing
│   └── nextshopsphere/    # Core Settings
├── frontend/              # React SPA
│   ├── src/
│   │   ├── redux/         # Slices (Cart, Auth, UI)
│   │   ├── api/           # Axios Interceptors
│   │   └── components/    # Atomic Design UI Components
└── nginx/                 # Reverse Proxy Configuration

🚀 Installation
1. Clone & Setup Backend
Bash

git clone [https://github.com/ClaraDEV-Fullstack/NextShopSphere.git](https://github.com/ClaraDEV-Fullstack/NextShopSphere.git)
cd NextShopSphere/backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
2. Setup Frontend
Bash

cd ../frontend
npm install
npm start
3. Docker Quickstart
Bash

docker-compose up --build
📚 API Documentation
Fully documented endpoints via Swagger UI:

Development: http://localhost:8000/api/docs/

Schema: http://localhost:8000/api/schema/

👨‍💻 Author
ClaraDEV-Fullstack

GitHub: @ClaraDEV-Fullstack

LinkedIn: Clara Beri

Portfolio: claradev.vercel.app

<p align="center"> Built with ❤️ for the modern web. </p>
