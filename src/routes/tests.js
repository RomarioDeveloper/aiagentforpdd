import { Router } from 'express';
import { generateDrivingTests } from '../services/geminiService.js';

const router = Router();

/**
 * GET /api/tests
 * Query: count (default 5), category (optional)
 */
router.get('/', async (req, res) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count) || 5, 1), 20);
    const category = req.query.category || null;

    const result = await generateDrivingTests(count, category);
    res.json(result);
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate test',
    });
  }
});

/**
 * POST /api/tests
 * Body: { count?: number, category?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { count: reqCount = 5, category = null } = req.body || {};
    const count = Math.min(Math.max(parseInt(reqCount) || 5, 1), 20);

    const result = await generateDrivingTests(count, category);
    res.json(result);
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate test',
    });
  }
});

/**
 * POST /api/tests/check
 * Body: { questions: [{ id, correctAnswer }], answers: { [id]: "A" } }
 */
router.post('/check', (req, res) => {
  const { questions, answers } = req.body || {};
  if (!questions || !answers) {
    return res.status(400).json({ error: 'questions and answers required' });
  }

  const results = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    return {
      id: q.id,
      correct: isCorrect,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const total = questions.length;
  const score = Math.round((correctCount / total) * 100);

  res.json({
    results,
    summary: {
      correct: correctCount,
      total,
      score,
    },
  });
});

export default router;
