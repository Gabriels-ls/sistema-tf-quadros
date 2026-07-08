require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor TF Quadros rodando!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const supabase = require('./services/supabaseClient');

app.get('/teste-supabase', async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*');

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
});