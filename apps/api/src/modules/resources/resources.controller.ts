import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthRequestUser } from '../auth/interfaces/jwt-payload.interface.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { QueryResourcesDto } from './dto/query-resources.dto.js';
import { UpdateResourceDto } from './dto/update-resource.dto.js';
import { ResourcesService } from './resources.service.js';

@UseGuards(JwtAuthGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  list(@CurrentUser() user: AuthRequestUser, @Query() query: QueryResourcesDto) {
    return this.resourcesService.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: AuthRequestUser, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthRequestUser, @Param('id') id: string) {
    return this.resourcesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@CurrentUser() user: AuthRequestUser, @Param('id') id: string) {
    return this.resourcesService.remove(user.id, id);
  }
}
