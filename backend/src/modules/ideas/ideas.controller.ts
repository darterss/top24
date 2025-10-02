import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TaskItemDto {
  @IsString()
  title!: string;
}

class CreateIdeaDto {
  @IsString()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskItemDto)
  tasks!: TaskItemDto[];
}

class UpdateTaskDto {
  @IsIn(['TODO', 'IN_PROGRESS', 'DONE'])
  status!: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  create(@Body() dto: CreateIdeaDto) {
    const tasks = (dto.tasks ?? []).map((t, idx) => ({ index: idx + 1, title: t.title }));
    return this.ideasService.createIdea(dto.userId, dto.title, dto.description, tasks);
  }

  @Get(':userId')
  list(@Param('userId') userId: string) {
    return this.ideasService.listIdeas(userId);
  }

  @Patch('task/:taskId')
  updateTask(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.ideasService.updateTaskStatus(taskId, dto.status);
  }
}


