import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto.js';

const noteInclude = {
  resource: {
    select: { id: true, title: true, url: true },
  },
} satisfies Prisma.NoteInclude;

type NoteWithResource = Prisma.NoteGetPayload<{ include: typeof noteInclude }>;

function toNoteResponse(note: NoteWithResource) {
  return {
    id: note.id,
    title: note.title,
    contentMarkdown: note.contentMarkdown,
    resourceId: note.resourceId,
    resource: note.resource,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: { userId },
      include: noteInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return notes.map(toNoteResponse);
  }

  async create(userId: string, dto: CreateNoteDto) {
    if (dto.resourceId) await this.assertResource(userId, dto.resourceId);

    const note = await this.prisma.note.create({
      data: {
        userId,
        title: dto.title?.trim() || 'Untitled note',
        contentMarkdown: dto.contentMarkdown ?? '',
        resourceId: dto.resourceId ?? null,
      },
      include: noteInclude,
    });

    return toNoteResponse(note);
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const existing = await this.prisma.note.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Note not found.');

    if (dto.resourceId) await this.assertResource(userId, dto.resourceId);

    const note = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() || 'Untitled note' } : {}),
        ...(dto.contentMarkdown !== undefined ? { contentMarkdown: dto.contentMarkdown } : {}),
        ...(dto.resourceId !== undefined ? { resourceId: dto.resourceId } : {}),
      },
      include: noteInclude,
    });

    return toNoteResponse(note);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.note.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Note not found.');

    await this.prisma.note.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertResource(userId: string, resourceId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, userId },
      select: { id: true },
    });
    if (!resource) throw new NotFoundException('Resource not found.');
  }
}
