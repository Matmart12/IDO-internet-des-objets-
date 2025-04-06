const express = require('express');
const router = express.Router();
const authController = require('./controllers');
const authMiddleware = require('./middleware');

// Routes
router.post('/connexion', authController.login);
router.get('/profil', authMiddleware, authController.getProfile);
module.exports = router;
