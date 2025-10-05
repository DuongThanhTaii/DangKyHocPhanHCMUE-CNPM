import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Use DATABASE_URL_DEVELOPMENT in development if available
if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL_DEVELOPMENT) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_DEVELOPMENT;
} else if (!process.env.DATABASE_URL && process.env.POSTGRES_HOST) {
  // Build DATABASE_URL from individual variables
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  process.env.DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"], // thêm "query","warn" khi cần debug
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
