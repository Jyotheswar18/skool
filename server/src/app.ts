import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { seedAdminAndConfig } from './seeds/admin.seed';
import { initSchedulers } from './schedulers';
import { errorHandler } from './middleware/errorHandler.middleware';
import { sendSuccess } from './shared/utils/apiResponse';

// Import routers
import authRouter from './modules/auth/auth.routes';
import studentRouter from './modules/student/student.routes';
import teacherRouter from './modules/teacher/teacher.routes';
import attendanceRouter from './modules/attendance/attendance.routes';
import feeRouter from './modules/fee/fee.routes';
import eventRouter from './modules/event/event.routes';
import notificationRouter from './modules/notification/notification.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import configRouter from './modules/schoolConfig/config.routes';
import marksRouter from './modules/marks/marks.routes';

// Create Express app
const app = express();

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Essential to view uploaded local files in development
  })
);

// Enable CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection (Express v5 in-place sanitizer)
app.use((req, res, next) => {
  const sanitize = (obj: any) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// Initialize Passport auth
app.use(passport.initialize());

// Limit requests from same API (Rate limiting)
const limiter = rateLimit({
  max: 200, // Limit each IP to 200 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// Serve static uploaded files (local disk fallback)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  return sendSuccess(res, { uptime: process.uptime() }, 'EduNest School Management API is healthy');
});

// Root API info & helper path
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>EduNest API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
          .card { background: #1e293b; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); max-width: 500px; border: 1px solid #334155; }
          h1 { color: #38bdf8; font-size: 2.25rem; margin-top: 0; }
          p { color: #94a3b8; line-height: 1.6; font-size: 1.1rem; }
          .status { display: inline-flex; align-items: center; background: #065f46; color: #34d399; padding: 6px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; margin-bottom: 20px; }
          .status-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
          .btn { display: inline-block; background: #0284c7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; transition: background 0.2s; }
          .btn:hover { background: #0369a1; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status"><span class="status-dot"></span>Backend Running</div>
          <h1>EduNest Server API</h1>
          <p>The backend API server and MongoDB database are connected and running successfully.</p>
          <p>To access the school management application, please visit the frontend Client URL:</p>
          <a href="http://localhost:5173" class="btn">Open EduNest App</a>
        </div>
      </body>
    </html>
  `);
});


// Mounting Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/fees', feeRouter);
app.use('/api/events', eventRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/config', configRouter);
app.use('/api/marks', marksRouter);

// Fallback for unmatched API routes
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`) as any;
  err.statusCode = 404;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Database connection & Server initialization
const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  // Seed default admin and configurations if missing
  await seedAdminAndConfig();

  // Initialize daily cron schedulers
  initSchedulers();

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`🚀 Server running in [${env.NODE_ENV}] mode on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to launch server application:', error);
  process.exit(1);
});

export default app;
