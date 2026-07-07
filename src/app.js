// Initialisation Express + middlewares globaux
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middleware de sécurité Helmet
app.use(helmet());

// Configuration CORS avec origines spécifiques
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:5000', // Flutter web (dev)
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting pour prévenir les attaques brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});
app.use('/api/', limiter);

// Rate limiting plus strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // seules les tentatives échouées comptent
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

// Middlewares globaux avec limites de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir le dossier /uploads en statique
// Cross-Origin-Resource-Policy: cross-origin nécessaire car le frontend (4200) charge
// des images depuis le backend (3000) — helmet impose "same-origin" par défaut.
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Endpoint de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import middlewares
const authMiddleware = require('./middlewares/auth.middleware');
const tenantMiddleware = require('./middlewares/tenant.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

// Swagger documentation
const specs = require('./config/swagger');
const swaggerUiConfig = require('./config/swagger-ui-config');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiConfig));

// Routes auth (login est public, autres endpoints nécessitent auth)
app.use('/api/auth/login', authLimiter, require('./modules/auth/auth.routes'));
app.use('/api/auth', require('./modules/auth/auth.routes'));

// Routes publiques
app.use('/api/invitations', require('./modules/invitations/invitations.routes'));
app.use('/api/password-reset', require('./modules/password-reset/password-reset.routes'));

// Routes administration plateforme (super_admin uniquement, sans tenant middleware)
app.use('/api/admin', require('./modules/admin/admin.routes'));

// Routes dahiras (pas de tenant middleware car gestion multi-dahira)
app.use('/api/dahiras', require('./modules/dahiras/dahiras.routes'));

// Routes API protégées (auth + tenant middleware dans les routes)
app.use('/api/membres', require('./modules/membres/membres.routes'));
app.use('/api/seances', require('./modules/seances/seances.routes'));
app.use('/api/cotisations', require('./modules/cotisations/cotisations.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/tresorerie', require('./modules/tresorerie/tresorerie.routes'));
app.use('/api/depenses', require('./modules/depenses/depenses.routes'));

// Middleware de gestion des erreurs (doit être à la fin)
app.use(errorMiddleware);

module.exports = app;
