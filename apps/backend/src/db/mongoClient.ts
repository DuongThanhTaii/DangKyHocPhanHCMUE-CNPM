import { PrismaClient as PrismaClientMongo } from "../../node_modules/.prisma/client-mongo";

let mongoClient: PrismaClientMongo | null = null;

/**
 * Get MongoDB Prisma Client instance (Singleton)
 */
export function getMongoClient(): PrismaClientMongo {
    if (!mongoClient) {
        mongoClient = new PrismaClientMongo({
            log: process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
        });
    }
    return mongoClient;
}

/**
 * Disconnect MongoDB client
 */
export async function disconnectMongo(): Promise<void> {
    if (mongoClient) {
        await mongoClient.$disconnect();
        mongoClient = null;
        console.log("✅ MongoDB disconnected");
    }
}