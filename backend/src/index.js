require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { sequelize } = require('./models/index.js');
const authRoutes = require('./routes/auth.js');
const promptsRoutes = require('./routes/prompts.js');

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Prompt Catalog API',
      description: 'RESTful API for managing AI prompt templates',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
      },
    ],
  },
  apis: ['./swagger.yaml'], // Path to the YAML file
};

const specs = swaggerJsdoc(swaggerOptions);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptsRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/api-docs.json', (req, res) => {
  res.json(specs);
});

// Initialize database and start server
async function startServer() {
  try {
    // Check if database file exists
    const dbPath = process.env.DB_PATH || './database.sqlite';
    const absoluteDbPath = path.resolve(dbPath);
    const dbExists = fs.existsSync(absoluteDbPath);
    
    console.log(`🔍 Checking database at: ${absoluteDbPath}`);
    
    if (dbExists) {
      console.log('📁 Database file exists, attempting to use existing database');
      await sequelize.authenticate();
      
      try {
        // Try gentle sync first (no alterations)
        await sequelize.sync({ alter: false });
        console.log('✅ Database connected and synced with existing data');
      } catch (syncError) {
        console.warn('⚠️  Schema mismatch detected. Recreating database from scratch...');
        console.log(`Backup of old database saved as: ${absoluteDbPath}.backup`);
        
        // Backup existing database
        if (fs.existsSync(absoluteDbPath)) {
          fs.copyFileSync(absoluteDbPath, `${absoluteDbPath}.backup`);
        }
        
        // Remove corrupted database and recreate
        fs.unlinkSync(absoluteDbPath);
        await sequelize.sync({ force: true });
        console.log('✅ Fresh database created successfully');
      }
    } else {
      console.log('🆕 Database file not found, creating new database from scratch');
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
      console.log('✅ New database created and synced');
    }
    
    console.log(`🚀 Server running on port ${PORT}`);
    
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;