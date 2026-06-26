"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const passport_1 = __importDefault(require("./config/passport"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const admin_seed_1 = require("./seeds/admin.seed");
const schedulers_1 = require("./schedulers");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const apiResponse_1 = require("./shared/utils/apiResponse");
// Import routers
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const student_routes_1 = __importDefault(require("./modules/student/student.routes"));
const teacher_routes_1 = __importDefault(require("./modules/teacher/teacher.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const fee_routes_1 = __importDefault(require("./modules/fee/fee.routes"));
const event_routes_1 = __importDefault(require("./modules/event/event.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/notification.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const config_routes_1 = __importDefault(require("./modules/schoolConfig/config.routes"));
const marks_routes_1 = __importDefault(require("./modules/marks/marks.routes"));
// Create Express app
const app = (0, express_1.default)();
// Set security HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Essential to view uploaded local files in development
}));
// Enable CORS
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Data sanitization against NoSQL query injection (Express v5 in-place sanitizer)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                }
                else {
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
app.use(passport_1.default.initialize());
// Limit requests from same API (Rate limiting)
const limiter = (0, express_rate_limit_1.default)({
    max: 200, // Limit each IP to 200 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);
// Serve static uploaded files (local disk fallback)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, { uptime: process.uptime() }, 'EduNest School Management API is healthy');
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/teachers', teacher_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/fees', fee_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/config', config_routes_1.default);
app.use('/api/marks', marks_routes_1.default);
// Fallback for unmatched API routes
app.use((req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.statusCode = 404;
    err.code = 'ROUTE_NOT_FOUND';
    next(err);
});
// Global Error Handler Middleware
app.use(errorHandler_middleware_1.errorHandler);
// Database connection & Server initialization
const startServer = async () => {
    // Connect to MongoDB
    await (0, database_1.connectDatabase)();
    // Seed default admin and configurations if missing
    await (0, admin_seed_1.seedAdminAndConfig)();
    // Initialize daily cron schedulers
    (0, schedulers_1.initSchedulers)();
    const port = env_1.env.PORT;
    app.listen(port, () => {
        console.log(`🚀 Server running in [${env_1.env.NODE_ENV}] mode on port ${port}`);
    });
};
startServer().catch((error) => {
    console.error('❌ Failed to launch server application:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map