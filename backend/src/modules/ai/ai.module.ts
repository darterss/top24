import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiTrackerService } from './ai-tracker.service';
import { PrismaService } from '../../shared/prisma.service';
import { RedisService } from '../../shared/redis.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiTrackerService, PrismaService, RedisService],
  exports: [AiService],
})
export class AiModule {}


