# Secure Content Portal

A full-stack web portal for sharing **videos**, **PDFs**, and **HTML pages** with two roles — **Admin** (upload / edit / delete) and **Viewer** (browse / view). Authentication uses **Auth0** with **Google OAuth**, and content is served through protected backend endpoints instead of permanent public URLs.

> This repository is built in phases. **Phase 2 (authentication)** is complete: Auth0 + Google OAuth login, JWT validation middleware, Mongo user records with role, and the `GET /api/users/me` endpoint. Content features arrive in later phases.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Auth0 React SDK |
| Backend | Node.js, Express, Mongoose |
| Auth | Auth0 (Google OAuth) + JWT validation |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Security | Helmet, CORS, server-side authorization |

## Project Structure

```text
secure-content-portal/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── .gitignore
├── package.json     # convenience scripts (concurrently)
└── README.md
```

## Local Setup

1. `npm install` (root) — installs `concurrently`
2. `npm run install:all` — installs client and server dependencies
3. Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env`, then fill in values
4. `npm run dev` — starts the Express API (port 5000) and the Vite dev server (port 5173) together

Verify the API at: <http://localhost:5000/api/health>

## Auth0 setup (for Phase 2)

- Enable the **Google** social connection in the Auth0 dashboard.
- Create a Single-Page Application and add `http://localhost:5173` to **Allowed Callback URLs** and **Allowed Logout URLs**.
- `AUTH0_AUDIENCE` uses the tenant's `/userinfo` audience so the backend can fetch the user profile server-side.
- New users are created with role `viewer` on first login. Add your email to `ADMIN_EMAILS` in `server/.env` to become `admin`.

## Current Phase

Phase 2 — Authentication:

- Auth0 + Google OAuth via the Auth0 React SDK
- Express `authenticate` middleware validating RS256 JWTs (issuer + audience + signature)
- Mongoose `User` model (`auth0Id`, `email`, `name`, `role`) connected to MongoDB Atlas
- `GET /api/users/me` — find-or-create the user with role `viewer` on first login
- Simple admin elevation via the `ADMIN_EMAILS` environment variable
- Axios interceptor attaches the Auth0 token from memory (never localStorage)