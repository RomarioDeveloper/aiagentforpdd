import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

const DRIVING_RULES_PROMPT = `Ты эксперт по Правилам дорожного движения Республики Казахстан (ПДД РК).
Генерируй ТОЛЬКО валидный JSON без markdown, комментариев и лишнего текста.

Формат ответа:
{
  "questions": [
    {
      "id": "уникальный-id",
      "text": "Текст вопроса",
      "options": [
        {"letter": "A", "text": "Вариант ответа 1"},
        {"letter": "B", "text": "Вариант ответа 2"},
        {"letter": "C", "text": "Вариант ответа 3"},
        {"letter": "D", "text": "Вариант ответа 4"}
      ],
      "correctAnswer": "A",
      "explanation": "Краткое объяснение правильного ответа",
      "category": "знаки|разметка|перекрестки|обгон|остановка|светофор|прочее"
    }
  ]
}

Правила:
- Всегда 4 варианта ответа (A, B, C, D)
- correctAnswer - буква правильного варианта
- Вопросы должны соответствовать реальным ПДД РК
- Категории: знаки, разметка, перекрестки, обгон, остановка, светофор, прочее
- Используй разнообразные темы из ПДД`;

export async function generateDrivingTests(count = 5, category = null) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY not configured. Add key to .env');
  }

  let prompt = `${DRIVING_RULES_PROMPT}\n\nСгенерируй ${count} вопросов по ПДД РК.`;
  if (category) {
    prompt += `\nФокус на категории: ${category}`;
  }
  prompt +=
    '\n\nВАЖНО: Верни ТОЛЬКО чистый JSON без markdown, без ```json, без backticks, без лишних символов, без комментариев. Начинай сразу с { и заканчивай }.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.8,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Gemini response: ' + text.slice(0, 200));
  }
}
