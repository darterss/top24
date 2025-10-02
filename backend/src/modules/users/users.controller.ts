import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() body: { name: string; email: string; telegramId?: string }) {
    return this.usersService.create(body);
  }

  @Get('by-telegram/:telegramId')
  findByTelegram(@Param('telegramId') telegramId: string) {
    return this.usersService.findByTelegramId(telegramId);
  }
}


