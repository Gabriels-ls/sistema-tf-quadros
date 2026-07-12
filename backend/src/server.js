require('dotenv').config();
const express = require('express');
const cors = require('cors');
const produtosRoutes = require('./routes/produtosRoutes');
const orcamentosRoutes = require('./routes/orcamentosRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor TF Quadros rodando!');
});

app.use('/produtos', produtosRoutes);

app.use('/orcamentos', orcamentosRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/chatbot', chatbotRoutes);