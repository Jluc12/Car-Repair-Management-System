# SmartPark CRPMS — Car Repair Management System

A full-stack web application for managing a car repair workshop. Built with **React 19**, **Express**, and **MongoDB**.

## Features

- **Car Management** — Register and manage vehicles with plate validation
- **Service Catalog** — Maintain a complete catalog of repair services
- **Service Records** — Track every repair job with payment status
- **Payments & Billing** — Process payments with auto-fill from service records
- **Reports & Analytics** — Generate daily payment reports and service bills
- **Dashboard** — Visual analytics with revenue charts and statistics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Recharts, React Router 7 |
| Backend | Node.js, Express 4, MongoDB (Mongoose 8) |
| Auth | Session-based (server-side sessions in MongoDB) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd CRPMS/backend-project
cp .env.example .env
# Edit .env with your MongoDB URI and a strong SESSION_SECRET
npm install
npm run dev
```

### Frontend Setup

```bash
cd CRPMS/frontend-project
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and proxies API requests to the backend.

### Environment Variables

#### Backend (`CRPMS/backend-project/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API server port |
| `MONGO_URI` | `mongodb://localhost:27017/crpms` | MongoDB connection string |
| `SESSION_SECRET` | — | Strong random string for session signing |
| `NODE_ENV` | `development` | Environment mode |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin (set to your frontend URL in production) |

#### Frontend (`CRPMS/frontend-project/.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API URL (not needed in dev with proxy) |

## Project Structure

```
RUGERO_CRPMS/
├── CRPMS/
│   ├── backend-project/
│   │   ├── server.js              # Express app entry point
│   │   ├── middleware/auth.js      # Session auth middleware
│   │   ├── models/                 # Mongoose schemas
│   │   └── routes/                 # API route handlers
│   └── frontend-project/
│       ├── src/
│       │   ├── api/               # Axios client
│       │   ├── components/        # Shared components (Layout, Stars)
│       │   ├── context/           # Auth context
│       │   └── pages/             # Page components
│       └── index.html
└── README.md
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Log in |
| `POST /api/auth/logout` | Log out |
| `GET /api/auth/me` | Get current session user |
| `GET/POST/PUT/DELETE /api/cars` | Car CRUD |
| `GET/POST/PUT/DELETE /api/services` | Service CRUD |
| `GET/POST/PUT/DELETE /api/servicerecords` | Service record CRUD |
| `GET/POST/PUT/DELETE /api/payments` | Payment CRUD |
| `GET /api/reports/service-bill` | Service bill report |
| `GET /api/reports/daily-payments` | Daily payments report |
| `GET /api/dashboard/stats` | Dashboard statistics |

## License

MIT
