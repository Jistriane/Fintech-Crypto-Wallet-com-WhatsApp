const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rotas básicas
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', (req, res) => {
  try {
    const { phone, password } = req.body;
    // TODO: Implementar registro real
    const user = {
      id: '1',
      phone,
      createdAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceId = req.headers['x-device-id'] || 'web';
    const ip = req.ip;
    
    // TODO: Implementar autenticação real
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
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/refresh', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    // TODO: Implementar refresh real
    const newToken = 'new-admin-token';
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    // TODO: Implementar logout real
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serviço de autenticação rodando na porta ${port}`);
});
