import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import testsRouter from './routes/tests.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tests', testsRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!config.geminiApiKey,
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'AI Driving Agent API',
    version: '1.0.0',
    endpoints: {
      'GET /api/tests': '?count=5&category=знаки',
      'POST /api/tests': 'body: { count, category }',
      'POST /api/tests/check': 'body: { questions, answers }',
      'GET /health': 'status',
    },
  });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  if (!config.geminiApiKey) {
    console.warn('GEMINI_API_KEY not set. Copy .env.example to .env and add your key.');
  }
});
