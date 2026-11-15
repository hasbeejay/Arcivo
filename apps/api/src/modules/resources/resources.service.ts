import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ResourceType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { QueryResourcesDto } from './dto/query-resources.dto.js';
import { UpdateResourceDto } from './dto/update-resource.dto.js';

const resourceInclude = {
  folder: true,
  tags: { include: { tag: true } },
  notes: { orderBy: { updatedAt: 'desc' }, take: 1 },
} satisfies Prisma.ResourceInclude;

type ResourceWithRelations = Prisma.ResourceGetPayload<{ include: typeof resourceInclude }>;

const READING_MINUTES: Record<ResourceType, number> = {
  ARTICLE: 6,
  VIDEO: 40,
  BOOK: 240,
  PAPER: 25,
  CODE: 8,
  THREAD: 5,
  GENERAL: 5,
};

function deriveResourceType(url: string): ResourceType {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (/(youtube|youtu\.be|vimeo)/.test(host)) return ResourceType.VIDEO;
    if (/(arxiv|doi\.org|acm\.org|ieee)/.test(host)) return ResourceType.PAPER;
    if (/(github|gitlab)/.test(host)) return ResourceType.CODE;
    if (/(reddit|news\.ycombinator|x\.com|twitter)/.test(host)) return ResourceType.THREAD;
    if (/(goodreads|books)/.test(host)) return ResourceType.BOOK;
    return ResourceType.ARTICLE;
  } catch {
    return ResourceType.ARTICLE;
  }
}

function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split('/').filter(Boolean).pop();
    if (slug) {
      const cleaned = slug
        .replace(/\.(html?|php|md)$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      if (cleaned.length > 3) {
        return cleaned
          .replace(/\b\w/g, (character) => character.toUpperCase())
          .slice(0, 120);
      }
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled resource';
  }
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) return [];
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
}

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: QueryResourcesDto) {
    const where: Prisma.ResourceWhereInput = { userId, isArchived: false };

    if (query.folderId) where.folderId = query.folderId;
    if (query.favorite !== undefined) where.isFavorite = query.favorite;

    const search = query.q?.trim();
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { aiSummary: { contains: search, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: search, mode: 'insensitive' } } } } },
        {
          notes: {
            some: {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { contentMarkdown: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const orderBy: Prisma.ResourceOrderByWithRelationInput =
      query.sort === 'oldest'
        ? { createdAt: 'asc' }
        : query.sort === 'title'
          ? { title: 'asc' }
          : { createdAt: 'desc' };

    const resources = await this.prisma.resource.findMany({
      where,
      include: resourceInclude,
      orderBy,
      take: 200,
    });

    return resources.map((resource) => this.toResponse(resource));
  }

  async findOne(userId: string, id: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, userId },
      include: resourceInclude,
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    return this.toResponse(resource);
  }

  async create(userId: string, dto: CreateResourceDto) {
    if (dto.folderId) await this.assertFolder(userId, dto.folderId);

    const url = dto.url.trim();
    const resourceType = dto.resourceType ?? deriveResourceType(url);
    const note = dto.note?.trim();

    const created = await this.prisma.$transaction(async (tx) => {
      const resource = await tx.resource.create({
        data: {
          userId,
          url,
          title: (dto.title?.trim() || titleFromUrl(url)).slice(0, 300),
          description: dto.description?.trim() || null,
          resourceType,
          folderId: dto.folderId ?? null,
          readingMinutes: READING_MINUTES[resourceType],
        },
      });

      await this.attachTags(tx, userId, resource.id, normalizeTags(dto.tags));

      if (note) {
        await tx.note.create({
          data: {
            userId,
            resourceId: resource.id,
            title: 'Quick note',
            contentMarkdown: note,
          },
        });
      }

      return resource;
    });

    return this.findOne(userId, created.id);
  }

  async update(userId: string, id: string, dto: UpdateResourceDto) {
    const existing = await this.prisma.resource.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Resource not found.');
    }

    if (dto.folderId) await this.assertFolder(userId, dto.folderId);

    await this.prisma.$transaction(async (tx) => {
      await tx.resource.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim().slice(0, 300) } : {}),
          ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
          ...(dto.resourceType !== undefined ? { resourceType: dto.resourceType } : {}),
          ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
          ...(dto.folderId !== undefined ? { folderId: dto.folderId } : {}),
        },
      });

      if (dto.tags !== undefined) {
        await tx.resourceTag.deleteMany({ where: { resourceId: id } });
        await this.attachTags(tx, userId, id, normalizeTags(dto.tags));
      }

      if (dto.note !== undefined) {
        const note = await tx.note.findFirst({
          where: { userId, resourceId: id },
          orderBy: { updatedAt: 'desc' },
        });
        const body = dto.note.trim();

        if (body) {
          if (note) {
            await tx.note.update({
              where: { id: note.id },
              data: { contentMarkdown: body },
            });
          } else {
            await tx.note.create({
              data: {
                userId,
                resourceId: id,
                title: 'Quick note',
                contentMarkdown: body,
              },
            });
          }
        } else if (note) {
          await tx.note.delete({ where: { id: note.id } });
        }
      }
    });

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.resource.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Resource not found.');
    }

    await this.prisma.resource.delete({ where: { id } });
    return { deleted: true };
  }

  private async attachTags(
    tx: Prisma.TransactionClient,
    userId: string,
    resourceId: string,
    tags: string[],
  ) {
    for (const name of tags) {
      const tag = await tx.tag.upsert({
        where: { userId_name: { userId, name } },
        create: { userId, name },
        update: {},
      });

      await tx.resourceTag.create({
        data: { resourceId, tagId: tag.id },
      });
    }
  }

  private async assertFolder(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found.');
    }
  }

  private toResponse(resource: ResourceWithRelations) {
    const summary = resource.aiSummary
      ? resource.aiSummary
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [];
    const note = resource.notes[0];

    return {
      id: resource.id,
      url: resource.url,
      title: resource.title,
      description: resource.description ?? '',
      resourceType: resource.resourceType,
      folderId: resource.folderId,
      folder: resource.folder
        ? {
            id: resource.folder.id,
            name: resource.folder.name,
            color: resource.folder.color,
            description: resource.folder.description ?? '',
          }
        : null,
      tags: resource.tags.map((entry) => entry.tag.name),
      isFavorite: resource.isFavorite,
      isArchived: resource.isArchived,
      hasSnapshot: Boolean(resource.contentSnapshot),
      readingMinutes: resource.readingMinutes ?? READING_MINUTES[resource.resourceType],
      aiSummary: summary,
      note: note
        ? {
            title: note.title,
            body: note.contentMarkdown,
            updatedAt: note.updatedAt,
          }
        : null,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
