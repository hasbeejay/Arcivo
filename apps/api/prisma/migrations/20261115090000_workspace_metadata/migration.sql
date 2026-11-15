-- Extend the resource kind enum for papers and discussion threads.
ALTER TYPE "ResourceType" ADD VALUE IF NOT EXISTS 'PAPER';
ALTER TYPE "ResourceType" ADD VALUE IF NOT EXISTS 'THREAD';

-- Folder descriptions and reading-time estimates used by the workspace UI.
ALTER TABLE "folders" ADD COLUMN "description" TEXT;

ALTER TABLE "resources" ADD COLUMN "reading_minutes" INTEGER;
