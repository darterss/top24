import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { RedisService } from '../../shared/redis.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private readonly redis: RedisService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateRoadmap(title: string): Promise<{ description: string; tasks: { title: string }[] }> {
    const cacheKey = `roadmap:${title}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const prompt = `Создай roadmap для проекта "${title}". Верни JSON с полями:
- description: краткое описание проекта (2-3 предложения)
- tasks: массив из 5-7 задач с полем title (конкретные шаги для реализации)


Пример формата:
{
  "description": "Описание проекта...",
  "tasks": [
    {"title": "Задача 1"},
    {"title": "Задача 2"}
  ]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      
      // Кэшируем на 1 час
      await this.redis.set(cacheKey, JSON.stringify(result), 3600);
      
      return result;
    } catch (error) {
      console.error('OpenAI error:', error);
      // Fallback к заглушке
      const tasks = Array.from({ length: 6 }).map((_, i) => ({ title: `Шаг ${i + 1} для проекта: ${title}` }));
      return { description: `Описание идеи: ${title}`, tasks };
    }
  }

  async reviewIdea(idea: { tasks: { status: 'TODO' | 'IN_PROGRESS' | 'DONE' }[] }) {
    const total = idea.tasks.length || 1;
    const done = idea.tasks.filter((t) => t.status === 'DONE').length;
    const completedPercent = Math.round((done / total) * 100);

    try {
      const prompt = `Проанализируй прогресс проекта:
- Выполнено: ${done} из ${total} задач (${completedPercent}%)
- Статусы задач: ${idea.tasks.map(t => `${t.status}`).join(', ')}

Дай краткий комментарий (1-2 предложения) на русском языке о том, что мешает прогрессу и что делать дальше.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const comment = completion.choices[0]?.message?.content || 'Продолжайте работу над проектом.';
      
      return { completedPercent, comment };
    } catch (error) {
      console.error('OpenAI review error:', error);
      const comment = completedPercent < 50 ? 'Фокус на первых шагах.' : 'Продолжайте в том же духе!';
      return { completedPercent, comment };
    }
  }
}


