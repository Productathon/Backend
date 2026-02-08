const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables immediately
dotenv.config();

const connectDB = require('./config/db');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Initialize Services
const { initializeClient } = require('./services/whatsappService');
const { initializeEmailService } = require('./services/emailService');

// Start services (Non-blocking)
initializeClient().catch(err => console.error('WhatsApp init failed:', err));
initializeEmailService();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Mount routers
const auth = require('./routes/authRoutes');
const leads = require('./routes/leadRoutes');
const accounts = require('./routes/accountRoutes');
const dossiers = require('./routes/dossierRoutes');
const dashboard = require('./routes/dashboardRoutes');
const analytics = require('./routes/analyticsRoutes');

// Public routes
app.use('/api/auth', auth);

// Notification Routes (Migrated from whatsapp_notification)
app.use('/api', require('./routes/notificationRoutes')); // Exposes /api/notify and /api/status
app.use('/api/email', require('./routes/emailRoutes'));   // Exposes /api/email/notify and /api/email/status

// Protected routes (can add middleware later if needed)
// app.use('/api/notifications', notifications); // Removed in favor of migrated routes
app.use('/api/leads', leads);
app.use('/api/accounts', accounts);
app.use('/api/dossiers', dossiers);
app.use('/api/dashboard', dashboard);
app.use('/api/analytics', analytics);
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Sales Portal API is running...');
});

// Start server (Avoid port 5000 on macOS - AirPlay/ControlCenter)
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
