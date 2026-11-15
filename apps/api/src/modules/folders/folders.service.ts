import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateFolderDto } from './dto/create-folder.dto.js';

type FolderWithCount = Prisma.FolderGetPayload<{
  include: { _count: { select: { resources: true } } };
}>;

function toFolderResponse(folder: FolderWithCount) {
  return {
    id: folder.id,
    name: folder.name,
    color: folder.color,
    description: folder.description ?? '',
    count: folder._count.resources,
    createdAt: folder.createdAt,
  };
}

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { resources: true } } },
    });

    return folders.map(toFolderResponse);
  }

  async create(userId: string, dto: CreateFolderDto) {
    const count = await this.prisma.folder.count({ where: { userId } });

    const folder = await this.prisma.folder.create({
      data: {
        userId,
        name: dto.name.trim(),
        color: dto.color ?? '#6366F1',
        description: dto.description?.trim() || null,
        sortOrder: count,
      },
      include: { _count: { select: { resources: true } } },
    });

    return toFolderResponse(folder);
  }
}
