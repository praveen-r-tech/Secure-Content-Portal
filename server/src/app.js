const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security headers (set by Helmet).
app.use(helmet());

// Allow requests from the frontend origin only.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

// JSON request body parsing.
app.use(express.json());

// Health check used to verify the API is running.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'secure-content-portal-api' });
});

// Current user endpoint (returns/creates the Mongo user for the JWT).
app.use('/api/users', userRoutes);

// Content routes will be mounted here in a later phase.

// 404 and central error handling must come last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;