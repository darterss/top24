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
exports.AiTrackerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../shared/prisma.service");
const ai_service_1 = require("./ai.service");
const node_fetch_1 = require("node-fetch");
let AiTrackerService = class AiTrackerService {
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.botToken = process.env.BOT_TOKEN || '';
        this.botUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async sendDailyReports() {
        console.log('Starting daily AI tracker at 20:00 MSK...');
        if (!this.botToken) {
            console.error('BOT_TOKEN not set, skipping daily reports');
            return;
        }
        try {
            const users = await this.prisma.user.findMany({
                where: { telegramId: { not: null } },
                include: {
                    ideas: {
                        include: { tasks: true }
                    }
                }
            });
            for (const user of users) {
                if (!user.telegramId || user.ideas.length === 0)
                    continue;
                try {
                    let reportText = '🌅 **ЕЖЕДНЕВНЫЙ ОТЧЁТ**\n\n';
                    for (const idea of user.ideas) {
                        const sortedTasks = idea.tasks.sort((a, b) => a.index - b.index);
                        const total = sortedTasks.length;
                        const done = sortedTasks.filter(t => t.status === 'DONE').length;
                        const inProgress = sortedTasks.filter(t => t.status === 'IN_PROGRESS').length;
                        const completedPercent = total > 0 ? Math.round((done / total) * 100) : 0;
                        reportText += `🎯 **${idea.title}**\n`;
                        reportText += `📈 Прогресс: ${completedPercent}% (${done}/${total} задач)\n`;
                        reportText += `🔄 В работе: ${inProgress} задач\n`;
                        try {
                            const aiReport = await this.ai.reviewIdea({ tasks: sortedTasks });
                            reportText += `🤖 AI: ${aiReport.comment}\n`;
                        }
                        catch {
                            reportText += `🤖 AI: Продолжайте работу над проектом.\n`;
                        }
                        reportText += '\n';
                    }
                    await this.sendTelegramMessage(user.telegramId, reportText);
                    console.log(`Daily report sent to user ${user.name} (${user.telegramId})`);
                }
                catch (error) {
                    console.error(`Error processing user ${user.name}:`, error);
                }
            }
            console.log('Daily AI tracker completed');
        }
        catch (error) {
            console.error('Daily tracker error:', error);
        }
    }
    async sendTelegramMessage(chatId, text) {
        try {
            const response = await (0, node_fetch_1.default)(`${this.botUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });
            if (!response.ok) {
                const error = await response.text();
                console.error(`Failed to send message to ${chatId}:`, error);
            }
        }
        catch (error) {
            console.error(`Error sending message to ${chatId}:`, error);
        }
    }
};
exports.AiTrackerService = AiTrackerService;
__decorate([
    (0, schedule_1.Cron)('00 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiTrackerService.prototype, "sendDailyReports", null);
exports.AiTrackerService = AiTrackerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], AiTrackerService);
//# sourceMappingURL=ai-tracker.service.js.map