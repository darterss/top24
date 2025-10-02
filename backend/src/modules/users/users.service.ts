import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ include: { ideas: { include: { tasks: true } } } });
  }

  create(body: { name: string; email: string; telegramId?: string }) {
    return this.prisma.user.upsert({
      where: { email: body.email },
      update: { name: body.name, telegramId: body.telegramId },
      create: { name: body.name, email: body.email, telegramId: body.telegramId },
    });
  }

  findByTelegramId(telegramId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { telegramId } });
  }
}


