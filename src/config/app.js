require('dotenv').config();

const APP_URL   = process.env.APP_URL      || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

module.exports = { APP_URL, FRONTEND_URL };
