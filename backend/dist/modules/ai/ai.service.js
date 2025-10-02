"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const redis_service_1 = require("../../shared/redis.service");
let AiService = class AiService {
    constructor(redis) {
        this.redis = redis;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async generateRoadmap(title) {
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
            await this.redis.set(cacheKey, JSON.stringify(result), 3600);
            return result;
        }
        catch (error) {
            console.error('OpenAI error:', error);
            const tasks = Array.from({ length: 6 }).map((_, i) => ({ title: `Шаг ${i + 1} для проекта: ${title}` }));
            return { description: `Описание идеи: ${title}`, tasks };
        }
    }
    async reviewIdea(idea) {
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
        }
        catch (error) {
            console.error('OpenAI review error:', error);
            const comment = completedPercent < 50 ? 'Фокус на первых шагах.' : 'Продолжайте в том же духе!';
            return { completedPercent, comment };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], AiService);
//# sourceMappingURL=ai.service.js.map