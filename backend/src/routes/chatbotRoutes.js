const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { conversar } = require('../controllers/chatbotController');

const limitadorChatbot = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.token || req.ip,
  handler: (req, res) => {
    res.status(429).json({ erro: 'Muitas mensagens em pouco tempo. Aguarde um instante e tente novamente.' });
  },
});

router.post('/', limitadorChatbot, conversar);

module.exports = router;