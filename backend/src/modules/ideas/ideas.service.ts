import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  createIdea(userId: string, title: string, description: string, tasks: { index: number; title: string }[]) {
    return this.prisma.idea.create({
      data: {
        title,
        description,
        userId,
        tasks: {
          create: tasks.map((t) => ({ index: t.index, title: t.title })),
        },
      },
      include: { tasks: true },
    });
  }

  listIdeas(userId: string) {
    return this.prisma.idea.findMany({ where: { userId }, include: { tasks: true } });
  }

  updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    return this.prisma.task.update({ where: { id: taskId }, data: { status } });
  }
}


