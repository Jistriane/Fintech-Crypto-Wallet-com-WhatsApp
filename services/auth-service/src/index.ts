import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AuthService } from '@fintech-crypto/common';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(json());

// Rotas básicas
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const authService = new AuthService();
    const user = await authService.registerUser(phone, password);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const deviceId = req.headers['x-device-id'] as string;
    const ip = req.ip;
    const authService = new AuthService();
    const token = await authService.loginUser(phone, password, deviceId, ip);
    res.json({ token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    const authService = new AuthService();
    const newToken = await authService.refreshSession(token);
    res.json({ token: newToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    const authService = new AuthService();
    await authService.invalidateSession(token);
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serviço de autenticação rodando na porta ${port}`);
});
