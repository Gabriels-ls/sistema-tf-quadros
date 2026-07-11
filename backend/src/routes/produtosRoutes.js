const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('../middlewares/autenticacao');
const {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  editarProduto,
  excluirProduto,
} = require('../controllers/produtosController');

router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);
router.post('/', verificarAutenticacao, criarProduto);
router.put('/:id', verificarAutenticacao, editarProduto);
router.delete('/:id', verificarAutenticacao, excluirProduto);

module.exports = router;