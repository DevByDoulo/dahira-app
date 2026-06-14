// Initialisation Express + middlewares globaux
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir le dossier /uploads en statique
app.use('/uploads', express.static('uploads'));

// Import middlewares
const authMiddleware = require('./middlewares/auth.middleware');
const tenantMiddleware = require('./middlewares/tenant.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

// Swagger documentation
const specs = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes auth (login est public, autres endpoints nécessitent auth)
app.use('/api/auth', require('./modules/auth/auth.routes'));

// Routes API protégées (auth + tenant middleware globaux)
// À ajouter plus tard pour les autres modules:
// app.use('/api/dahiras', authMiddleware, tenantMiddleware, require('./modules/dahiras/dahiras.routes'));
// app.use('/api/membres', authMiddleware, tenantMiddleware, require('./modules/membres/membres.routes'));
// etc.

// Middleware de gestion des erreurs (doit être à la fin)
app.use(errorMiddleware);

module.exports = app;
