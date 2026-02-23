require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb');
const automationService = require('./services/automationService');
const { job: dailyInterestJob } = require('./cron/dailyInterest');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? true  // Allow all origins in production
        : [
            'http://localhost:3000',  // Admin Web
            'http://localhost:3001',  // Business Web
            'http://localhost:5173',  // Vite default
            'http://localhost:5174',   // Vite default
            'https://bcm-theta.vercel.app', // Admin Vercel
            'https://business-web-orcin.vercel.app' // Business Vercel
        ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/business', require('./routes/business.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/shares', require('./routes/share.routes'));
app.use('/api/capital', require('./routes/capital.routes'));
app.use('/api/plans', require('./routes/plan.routes'));
app.use('/api/investor', require('./routes/investor.routes'));
app.use('/api/fds', require('./routes/fds.routes'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BCM Backend API is running',
        database: 'MongoDB Atlas',
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to list all routes (only in development)
app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = middleware.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '');
                    routes.push({
                        path: path + handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({ success: true, routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        try {
            await connectDB();
        } catch (dbError) {
            console.error('❌ MongoDB Connection Failed (Proceeding anyway)', dbError.message);
        }

        app.listen(PORT, () => {

            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BCM Platform Backend API                           ║
║   Server running on port ${PORT}                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
║   Database: MongoDB Atlas                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);

            // Start automation services
            if (process.env.NODE_ENV === 'production') {
                automationService.startAll();
                dailyInterestJob.start();
                console.log('✓ Automation services & Daily Interest Job started');
            } else {
                console.log('⚠ Automation services disabled in development mode');
                console.log('  To enable, set NODE_ENV=production');
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    automationService.stopAll();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    automationService.stopAll();
    process.exit(0);
});

startServer();

module.exports = app;
