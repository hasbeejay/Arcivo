import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Resources and folders (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;

  const email = `e2e-res-spec-${Date.now()}@example.com`;
  const otherEmail = `e2e-res-spec-other-${Date.now()}@example.com`;
  const password = 'SuperSecret123';

  let token = '';
  let otherToken = '';
  let folderId = '';
  let secondFolderId = '';
  let otherFolderId = '';
  let resourceId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = new PrismaClient();

    const first = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, fullName: 'Resource Spec' })
      .expect(201);
    token = first.body.accessToken;

    const second = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: otherEmail, password, fullName: 'Other Spec' })
      .expect(201);
    otherToken = second.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'e2e-res-spec-' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('creates the default folders for a new account', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/folders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(4);
    expect(res.body.map((folder: { name: string }) => folder.name)).toEqual([
      'Research',
      'University',
      'Web Development',
      'Inspiration',
    ]);
    expect(res.body[0].description).toBe('Deep dives and papers');
    folderId = res.body[0].id;
    secondFolderId = res.body[1].id;

    const other = await request(app.getHttpServer())
      .get('/api/v1/folders')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    otherFolderId = other.body[0].id;
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/v1/resources').expect(401);
    await request(app.getHttpServer()).get('/api/v1/folders').expect(401);
  });

  it('rejects an invalid URL', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'not a url' })
      .expect(400);
  });

  it('creates a resource with tags and a note', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({
        url: 'https://youtube.com/watch?v=postgres-deep-dive',
        title: 'PostgreSQL Deep Dive',
        description: 'Indexes and query planning.',
        resourceType: 'VIDEO',
        folderId,
        tags: ['Backend', 'backend', ' api '],
        note: 'Watch the indexing chapter again.',
      })
      .expect(201);

    expect(res.body.title).toBe('PostgreSQL Deep Dive');
    expect(res.body.resourceType).toBe('VIDEO');
    expect(res.body.readingMinutes).toBe(40);
    expect(res.body.tags).toEqual(['backend', 'api']);
    expect(res.body.isFavorite).toBe(false);
    expect(res.body.hasSnapshot).toBe(false);
    expect(res.body.aiSummary).toEqual([]);
    expect(res.body.note.body).toBe('Watch the indexing chapter again.');
    expect(res.body.folder.id).toBe(folderId);

    resourceId = res.body.id;
  });

  it('lists and searches resources', async () => {
    const all = await request(app.getHttpServer())
      .get('/api/v1/resources')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(all.body).toHaveLength(1);

    const byTag = await request(app.getHttpServer())
      .get('/api/v1/resources?q=backend')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byTag.body).toHaveLength(1);

    const byNote = await request(app.getHttpServer())
      .get('/api/v1/resources?q=indexing')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byNote.body).toHaveLength(1);

    const byFolder = await request(app.getHttpServer())
      .get(`/api/v1/resources?folderId=${folderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byFolder.body).toHaveLength(1);

    const none = await request(app.getHttpServer())
      .get('/api/v1/resources?q=does-not-exist')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(none.body).toHaveLength(0);
  });

  it('counts resources on folders', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/folders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.find((folder: { id: string }) => folder.id === folderId).count).toBe(1);
  });

  it('favorites a resource and filters by favorites', async () => {
    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFavorite: true })
      .expect(200);
    expect(updated.body.isFavorite).toBe(true);

    const favorites = await request(app.getHttpServer())
      .get('/api/v1/resources?favorite=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(favorites.body).toHaveLength(1);
    expect(favorites.body[0].id).toBe(resourceId);
  });

  it('moves a resource between folders and clears the folder', async () => {
    const moved = await request(app.getHttpServer())
      .patch(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: secondFolderId })
      .expect(200);
    expect(moved.body.folderId).toBe(secondFolderId);
    expect(moved.body.folder.id).toBe(secondFolderId);

    const cleared = await request(app.getHttpServer())
      .patch(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: null })
      .expect(200);
    expect(cleared.body.folderId).toBeNull();
    expect(cleared.body.folder).toBeNull();
  });

  it("refuses to move a resource into another account's folder", async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: otherFolderId })
      .expect(404);
  });

  it('does not leak resources or folders across accounts', async () => {
    const otherList = await request(app.getHttpServer())
      .get('/api/v1/resources')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect(otherList.body).toHaveLength(0);

    await request(app.getHttpServer())
      .get(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ isFavorite: false })
      .expect(404);

    await request(app.getHttpServer())
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ url: 'https://example.com/secret', folderId })
      .expect(404);
  });

  it('creates a custom folder', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Reading list', color: '#0EA5E9', description: 'Saved for later' })
      .expect(201);

    expect(res.body.name).toBe('Reading list');
    expect(res.body.description).toBe('Saved for later');
    expect(res.body.count).toBe(0);
  });

  it('deletes a resource', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.deleted).toBe(true);

    await request(app.getHttpServer())
      .get(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
