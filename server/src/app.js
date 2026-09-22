const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security headers with support for inline media streaming & sandboxed iframes.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: false,
  })
);

// Allow requests from frontend with credentials (HttpOnly cookies).
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://secure-content-portal-chi.vercel.app', // Your Vercel frontend
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean); // Filters out undefined if FRONTEND_URL isn't set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Parse cookies and JSON bodies.
app.use(cookieParser());
app.use(express.json());

// Health check endpoint.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'secure-content-portal-api' });
});

// Authentication endpoints (Google OAuth, dev login, session check, logout).
app.use('/api/auth', authRoutes);

// User endpoints.
app.use('/api/users', userRoutes);

// Content metadata and protected token-gated streaming endpoints.
app.use('/api/content', contentRoutes);

// 404 and central error handling.
app.use(notFound);
app.use(errorHandler);

module.exports = app;