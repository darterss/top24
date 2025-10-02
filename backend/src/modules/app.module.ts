import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../shared/prisma.service';
import { UsersModule } from './users/users.module';
import { IdeasModule } from './ideas/ideas.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule, 
    IdeasModule, 
    AiModule
  ],
  providers: [PrismaService],
})
export class AppModule {}


