# Secure Content Portal

A full-stack web portal for sharing **videos**, **PDFs**, and **HTML pages** with two roles — **Admin** (upload / edit / delete) and **Viewer** (browse / view). Authentication uses **Google OAuth** via **Google Cloud**, and content is served through protected backend endpoints instead of permanent public URLs.

## 1. Project Overview

Secure Content Portal is a role-based content management system. Admins upload and manage videos, PDFs, and HTML pages. Viewers browse and view content but cannot perform admin operations. All content is protected — permanent storage URLs are never exposed to the frontend.

## 2. Features

- **Google OAuth login** (no passwords stored)
- **Two roles**: Admin and Viewer (default: Viewer)
- **Admin**: upload, edit metadata, delete content
- **Viewer**: browse and view content
- **Protected content delivery** — files served through signed URLs, not permanent public links
- **File validation** — type and size checked on the backend (signature sniffing, not just extensions)
- **Server-side authorization** — hiding buttons in React is NOT sufficient; the backend enforces permissions

## 3. Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Google Identity Services |
| Backend | Node.js, Express, Mongoose |
| Auth | Google OAuth + JWT validation |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Security | Helmet, CORS, server-side authorization |

## 4. Project Structure

```text
secure-content-portal/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── .gitignore
├── package.json     # convenience scripts (concurrently)
└── README.md
```

## 5. Architecture

```
User
  ↓
React (Vite)
  ↓
Google Identity Services
  ↓
Authenticated user (JWT)
  ↓
Express backend
  ↓
JWT validation (google-auth-library)
  ↓
MongoDB user lookup/create
  ↓
Role-based access control
```

**Authentication flow**: User logs in via Google Identity Services → receives a Google ID token (JWT) → backend verifies the token signature using `google-auth-library` → looks up or creates user in MongoDB → assigns role (viewer by default, admin if email is in `ADMIN_EMAILS`).

**Authorization flow**: Every protected request passes through `authenticate` middleware (validates JWT) → `loadUser` middleware (attaches user to request) → `requireAdmin` middleware (checks role, returns 403 if not admin).

**Content protection**: Files are stored in Cloudinary. The frontend never receives a permanent public URL. Instead, `GET /api/content/:id/view` generates a signed, tamper-proof URL on the backend and returns it to authenticated users.

## 6. Environment Variables

### Server (`server/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | API port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (from Google Cloud Console) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend origin for CORS (e.g., `http://localhost:5173`) |
| `ADMIN_EMAILS` | Comma-separated emails granted admin role |

### Client (`client/.env`)

| Variable | Description |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_API_BASE_URL` | Backend URL (leave empty in dev — Vite proxies `/api`) |

## 7. Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Google Cloud account (free tier)

### Steps

1. **Clone and install**
   ```bash
   npm install          # root — installs concurrently
   npm run install:all  # installs client + server dependencies
   ```

2. **Configure environment variables**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
   Fill in the values in both `.env` files.

3. **Run the application**
   ```bash
   npm run dev
   ```
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:5000/api/health>

## 8. Running the Application

| Command | Description |
| --- | --- |
| `npm run dev` | Start both frontend and backend in development |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build the frontend for production |
| `npm run install:all` | Install all dependencies |

## 9. Deployment

### Free-tier services

| Service | Platform | Purpose |
| --- | --- | --- |
| Frontend | Vercel | React SPA hosting |
| Backend | Render | Node.js API hosting |
| Database | MongoDB Atlas | Data storage |
| Storage | Cloudinary | File storage |
| Auth | Google Cloud OAuth | Authentication |

### Deploy to Vercel (frontend)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Set the **Root Directory** to `client`
5. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_BASE_URL` (your Render backend URL, e.g., `https://your-api.onrender.com`)
6. Click **Deploy**

### Deploy to Render (backend)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (your Vercel frontend URL)
   - `ADMIN_EMAILS`
7. Click **Create Web Service**

### Post-deployment


## 10. Security

### What's implemented

- **Google OAuth** — no passwords stored
- **JWT validation** — every protected request verified via JWKS
- **Server-side authorization** — backend enforces admin-only access
- **No tokens in localStorage** — tokens are kept in memory only
- **Helmet** — security headers
- **CORS** — restricted to frontend origin
- **File validation** — type (signature sniffing) and size limits on the backend
- **Signed URLs** — Cloudinary URLs are tamper-proof, not permanent public links
- **Sandboxed iframes** — HTML content rendered in `sandbox="allow-scripts"`

### Known limitations

- **Browser-delivered content cannot be made completely impossible to capture.** A determined user can screen-record or use developer tools to access media streams.
- **Signed URLs expire** but are valid for a window of time — this is a trade-off between security and usability.
- **No DRM** — production systems could consider watermarking or dedicated DRM solutions for stronger protection.

## 11. Known Limitations

- No search or filter functionality
- No pagination for large content lists
- No email verification requirement (relies on Google OAuth)
- No audit logging of admin actions
- No rate limiting on API endpoints

## 12. Future Improvements

- Search and filter content
- Pagination
- Content categories/tags
- Audit logging
- Rate limiting
- Watermarking for videos
- Email notifications for new content

- Update Google Cloud Console to add your Vercel URL to **Authorized JavaScript origins** and **Authorized redirect URIs**
