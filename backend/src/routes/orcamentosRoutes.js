const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('../middlewares/autenticacao');
const {
  criarOrcamento,
  listarOrcamentosPorToken,
  listarTodosOrcamentos,
} = require('../controllers/orcamentosController');

router.post('/', criarOrcamento);
router.get('/token/:token', listarOrcamentosPorToken);
router.get('/', verificarAutenticacao, listarTodosOrcamentos);

module.exports = router;