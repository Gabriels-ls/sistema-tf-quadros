const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('../middlewares/autenticacao');
const {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  editarProduto,
  excluirProduto,
  criarVariacao,
  editarVariacao,
  excluirVariacao,
} = require('../controllers/produtosController');

router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);
router.post('/', verificarAutenticacao, criarProduto);
router.put('/:id', verificarAutenticacao, editarProduto);
router.delete('/:id', verificarAutenticacao, excluirProduto);

router.post('/:produtoId/variacoes', verificarAutenticacao, criarVariacao);
router.put('/:produtoId/variacoes/:variacaoId', verificarAutenticacao, editarVariacao);
router.delete('/:produtoId/variacoes/:variacaoId', verificarAutenticacao, excluirVariacao);

module.exports = router;