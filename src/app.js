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
const swaggerUiConfig = require('./config/swagger-ui-config');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiConfig));

// Routes auth (login est public, autres endpoints nécessitent auth)
app.use('/api/auth', require('./modules/auth/auth.routes'));

// Routes publiques
app.use('/api/invitations', require('./modules/invitations/invitations.routes'));
app.use('/api/password-reset', require('./modules/password-reset/password-reset.routes'));

// Routes dahiras (pas de tenant middleware car gestion multi-dahira)
app.use('/api/dahiras', require('./modules/dahiras/dahiras.routes'));

// Routes API protégées (auth + tenant middleware dans les routes)
app.use('/api/membres', require('./modules/membres/membres.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/seances', require('./modules/seances/seances.routes'));
app.use('/api/cotisations', require('./modules/cotisations/cotisations.routes'));
app.use('/api/annonces', require('./modules/annonces/annonces.routes'));
app.use('/api/evenements', require('./modules/evenements/evenements.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/tresorerie', require('./modules/tresorerie/tresorerie.routes'));
app.use('/api/presences', require('./modules/presences/presences.routes'));
app.use('/api/recus', require('./modules/recus/recus.routes'));
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/depenses', require('./modules/depenses/depenses.routes'));

// Middleware de gestion des erreurs (doit être à la fin)
app.use(errorMiddleware);

module.exports = app;
