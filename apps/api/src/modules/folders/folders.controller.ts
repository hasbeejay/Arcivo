import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthRequestUser } from '../auth/interfaces/jwt-payload.interface.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateFolderDto } from './dto/create-folder.dto.js';
import { FoldersService } from './folders.service.js';

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  list(@CurrentUser() user: AuthRequestUser) {
    return this.foldersService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthRequestUser, @Body() dto: CreateFolderDto) {
    return this.foldersService.create(user.id, dto);
  }
}
