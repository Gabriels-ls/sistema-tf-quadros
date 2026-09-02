const express = require('express');
const multer = require('multer');
const router = express.Router();
const verificarAutenticacao = require('../middlewares/autenticacao');
const {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  editarProduto,
  excluirProduto,
  criarGrupoVariacao,
  editarGrupoVariacao,
  excluirGrupoVariacao,
  uploadImagem,
} = require('../controllers/produtosController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Arquivo deve ser uma imagem.'));
    }
    cb(null, true);
  },
});

router.get('/', listarProdutos);
router.post('/upload-imagem', verificarAutenticacao, upload.single('imagem'), uploadImagem);
router.get('/:id', buscarProdutoPorId);
router.post('/', verificarAutenticacao, criarProduto);
router.put('/:id', verificarAutenticacao, editarProduto);
router.delete('/:id', verificarAutenticacao, excluirProduto);

router.post('/:produtoId/grupos-variacao', verificarAutenticacao, criarGrupoVariacao);
router.put('/:produtoId/grupos-variacao/:grupoId', verificarAutenticacao, editarGrupoVariacao);
router.delete('/:produtoId/grupos-variacao/:grupoId', verificarAutenticacao, excluirGrupoVariacao);

module.exports = router;