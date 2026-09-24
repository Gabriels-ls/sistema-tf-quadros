const express = require('express');
const cors = require('cors');
const produtosRoutes = require('./routes/produtosRoutes');
const opcoesVariacaoRoutes = require('./routes/opcoesVariacaoRoutes');
const orcamentosRoutes = require('./routes/orcamentosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor TF Quadros rodando!');
});

app.use('/produtos', produtosRoutes);
app.use('/grupos-variacao', opcoesVariacaoRoutes);
app.use('/orcamentos', orcamentosRoutes);
app.use('/admin', adminRoutes);
app.use('/chatbot', chatbotRoutes);

module.exports = app;
