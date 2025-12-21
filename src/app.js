import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth-routes.js';
import todoRoutes from './routes/todo-routes.js';
import dotenv from 'dotenv';
import authMiddleware from './middlewares/auth-middleware.js';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//middlewares
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(xss());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//routes
app.use('/auth', authLimiter, authRoutes);
app.use('/todos', authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
