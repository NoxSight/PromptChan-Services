require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Auto-migrate for development
    
    console.log('✅ Database connected and synced');
    console.log(`🚀 Server running on port ${PORT}`);
    
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;