const express = require('express');
const router = express.Router();
const { listarProdutos } = require('../controllers/produtosController');

router.get('/', listarProdutos);

module.exports = router;