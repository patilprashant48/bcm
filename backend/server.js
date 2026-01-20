require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb');
const automationService = require('./services/automationService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',  // Admin Web
        'http://localhost:3001',  // Business Web
        'http://localhost:5173',  // Vite default
        'http://localhost:5174'   // Vite default
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BCM Backend API is running',
        database: 'MongoDB Atlas',
        timestamp: new Date().toISOString()
    });
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
                console.log('✓ Automation services started');
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
