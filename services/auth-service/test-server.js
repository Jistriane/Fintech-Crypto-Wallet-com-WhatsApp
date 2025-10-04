const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = {
    id: '1',
    email,
    name: 'Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const token = 'admin-token';
  res.json({ user, token });
});

app.listen(port, () => {
  console.log(`Serviço de autenticação rodando na porta ${port}`);
});
