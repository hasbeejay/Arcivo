import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL database.');
    } catch (error) {
      this.logger.warn(
        `PostgreSQL not connected on boot (${(error as Error).message}). Ensure Docker or local PostgreSQL is running (e.g., 'docker compose up -d').`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
