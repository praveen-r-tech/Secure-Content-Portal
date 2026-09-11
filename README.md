# Secure Content Portal

A full-stack web portal for sharing **videos**, **PDFs**, and **HTML pages** with two roles — **Admin** (upload / edit / delete) and **Viewer** (browse / view). Authentication uses **Auth0** with **Google OAuth**, and content is served through protected backend endpoints instead of permanent public URLs.

> This repository is being built in phases. **Phase 1 (project setup)** is complete; authentication, content features, protected viewing, and deployment arrive in later phases.

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

## Current Phase

Phase 1 — Project Setup:

- Express backend with Helmet, CORS, JSON parsing, central error handling, and a `GET /api/health` endpoint
- React + Vite frontend that reports the backend connection status
- Vite dev proxy forwards `/api` requests to the backend (no CORS issues in development)
- Empty module folders staged for future phases (auth, content, storage)
- `.env.example` templates for both applications