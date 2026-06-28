const express = require('express');
const router = express.Router();
const { searchController } = require('./search.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', searchController);

module.exports = router;
