const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(express.json());
app.use(cors());

// ✅ Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando! 🚀' });
});

// ✅ CREATE - Criar usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ READ - Listar todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ READ - Buscar usuário por ID
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATE - Atualizar usuário
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *',
      [nome, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE - Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});