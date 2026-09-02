const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('../middlewares/autenticacao');
const { criarOpcao, editarOpcao, excluirOpcao } = require('../controllers/opcoesVariacaoController');

router.post('/:grupoId/opcoes', verificarAutenticacao, criarOpcao);
router.put('/:grupoId/opcoes/:opcaoId', verificarAutenticacao, editarOpcao);
router.delete('/:grupoId/opcoes/:opcaoId', verificarAutenticacao, excluirOpcao);

module.exports = router;
