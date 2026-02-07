const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Mount routers
const leads = require('./routes/leadRoutes');
const accounts = require('./routes/accountRoutes');
const dossiers = require('./routes/dossierRoutes');
const dashboard = require('./routes/dashboardRoutes');
const analytics = require('./routes/analyticsRoutes');

app.use('/api/leads', leads);
app.use('/api/accounts', accounts);
app.use('/api/dossiers', dossiers);
app.use('/api/dashboard', dashboard);
app.use('/api/analytics', analytics);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Sales Portal API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
