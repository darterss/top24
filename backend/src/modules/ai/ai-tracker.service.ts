import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma.service';
import { AiService } from './ai.service';
import fetch from 'node-fetch';

@Injectable()
export class AiTrackerService {
  private readonly botToken: string;
  private readonly botUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {
    this.botToken = process.env.BOT_TOKEN || '';
    this.botUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  @Cron('00 10 * * *') // 13:00 МСК (10:00 UTC)
  async sendDailyReports() {
    console.log('Starting daily AI tracker at 20:00 MSK...');
    
    if (!this.botToken) {
      console.error('BOT_TOKEN not set, skipping daily reports');
      return;
    }
    
    try {
      // Получаем всех пользователей с идеями
      const users = await this.prisma.user.findMany({
        where: { telegramId: { not: null } },
        include: {
          ideas: {
            include: { tasks: true }
          }
        }
      });

      for (const user of users) {
        if (!user.telegramId || user.ideas.length === 0) continue;

        try {
          let reportText = '🌅 **ЕЖЕДНЕВНЫЙ ОТЧЁТ**\n\n';
          
          for (const idea of user.ideas) {
            // Сортируем задачи по index
            const sortedTasks = idea.tasks.sort((a, b) => a.index - b.index);
            const total = sortedTasks.length;
            const done = sortedTasks.filter(t => t.status === 'DONE').length;
            const inProgress = sortedTasks.filter(t => t.status === 'IN_PROGRESS').length;
            const completedPercent = total > 0 ? Math.round((done / total) * 100) : 0;
            
            reportText += `🎯 **${idea.title}**\n`;
            reportText += `📈 Прогресс: ${completedPercent}% (${done}/${total} задач)\n`;
            reportText += `🔄 В работе: ${inProgress} задач\n`;
            
            // Получаем AI комментарий для этой идеи
            try {
              const aiReport = await this.ai.reviewIdea({ tasks: sortedTasks });
              reportText += `🤖 AI: ${aiReport.comment}\n`;
            } catch {
              reportText += `🤖 AI: Продолжайте работу над проектом.\n`;
            }
            
            reportText += '\n';
          }
          
          // Отправляем сообщение в Telegram
          await this.sendTelegramMessage(user.telegramId, reportText);
          console.log(`Daily report sent to user ${user.name} (${user.telegramId})`);
          
        } catch (error) {
          console.error(`Error processing user ${user.name}:`, error);
        }
      }
      
      console.log('Daily AI tracker completed');
    } catch (error) {
      console.error('Daily tracker error:', error);
    }
  }

  private async sendTelegramMessage(chatId: string, text: string): Promise<void> {
    try {
      const response = await fetch(`${this.botUrl}/sendMessage`, {
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
    } catch (error) {
      console.error(`Error sending message to ${chatId}:`, error);
    }
  }
}
