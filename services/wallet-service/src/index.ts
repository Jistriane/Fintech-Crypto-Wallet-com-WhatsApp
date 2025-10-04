import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import walletRoutes from './routes/wallet';
import tokenRoutes from './routes/token';

const app = express();
const port = process.env.PORT || 3334;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Routes
app.use('/', walletRoutes);
app.use('/', tokenRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Wallet service running on port ${port}`);
});

