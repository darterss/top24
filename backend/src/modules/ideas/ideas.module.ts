import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [IdeasController],
  providers: [IdeasService, PrismaService],
  exports: [IdeasService],
})
export class IdeasModule {}


