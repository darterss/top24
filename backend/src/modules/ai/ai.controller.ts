import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../../shared/prisma.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService, private readonly prisma: PrismaService) {}

  @Post('roadmap')
  roadmap(@Body() body: { title: string }) {
    return this.ai.generateRoadmap(body.title);
  }

  @Get('report/:userId')
  async report(@Param('userId') userId: string) {
    const ideas = await this.prisma.idea.findMany({ where: { userId }, include: { tasks: true } });
    const allTasks = ideas.flatMap((i) => i.tasks);
    return this.ai.reviewIdea({ tasks: allTasks });
  }

  @Post('review/:ideaId')
  async review(@Param('ideaId') ideaId: string) {
    const idea = await this.prisma.idea.findUniqueOrThrow({ where: { id: ideaId }, include: { tasks: true } });
    return this.ai.reviewIdea(idea);
  }
}


