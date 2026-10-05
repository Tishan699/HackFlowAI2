require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { initPostgres, isPgConnected } = require('./config/postgres');

const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static file hosting for uploaded project deliverables & PDFs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve the compiled frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'HackFlow Backend API',
    version: '1.0.0',
    database: isPgConnected() ? 'Supabase PostgreSQL (Live)' : 'Local Storage Bridge',
    mfaEmailVerification: 'active',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/judges', require('./routes/judges'));
app.use('/api/organizers', require('./routes/organizers'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/support', require('./routes/support'));

// 404 Route Handler for API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Catch-all route to serve the React frontend for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`[INFO] HackFlow Backend Server running on port ${PORT}`);
  console.log(`[INFO] Base URL: http://localhost:${PORT}/api`);
  console.log(`[INFO] MFA Email Verification: Enabled`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================\n`);

  // Connect to Supabase PostgreSQL Database
  await initPostgres();
});
