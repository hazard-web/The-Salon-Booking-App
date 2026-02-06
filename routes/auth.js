const express = require('express');
const { loginPage ,register, login } = require('../controllers/auth');
const authRouter = express.Router();

authRouter.get("/", loginPage);
authRouter.post('/register', register);
authRouter.post('/login', login);

module.exports = authRouter;
