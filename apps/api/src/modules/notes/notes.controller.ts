import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthRequestUser } from '../auth/interfaces/jwt-payload.interface.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto.js';
import { NotesService } from './notes.service.js';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(@CurrentUser() user: AuthRequestUser) {
    return this.notesService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthRequestUser, @Body() dto: CreateNoteDto) {
    return this.notesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() user: AuthRequestUser, @Param('id') id: string) {
    return this.notesService.remove(user.id, id);
  }
}
