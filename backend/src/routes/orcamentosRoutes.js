const express = require('express');
const router = express.Router();
const { criarOrcamento, listarOrcamentosPorToken } = require('../controllers/orcamentosController');

router.post('/', criarOrcamento);
router.get('/token/:token', listarOrcamentosPorToken);

module.exports = router;