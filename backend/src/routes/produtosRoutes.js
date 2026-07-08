const express = require('express');
const router = express.Router();
const { listarProdutos, buscarProdutoPorId } = require('../controllers/produtosController');

router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);

module.exports = router;