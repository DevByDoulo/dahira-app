// Initialisation Express + middlewares globaux
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir le dossier /uploads en statique
app.use('/uploads', express.static('uploads'));

// Routes (à ajouter plus tard)
// app.use('/api/auth', require('./modules/auth/auth.routes'));
// app.use('/api/dahiras', require('./modules/dahiras/dahiras.routes'));
// etc.

module.exports = app;
