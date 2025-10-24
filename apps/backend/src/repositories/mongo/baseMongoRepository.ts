import { PrismaClient as PrismaClientMongo } from "../../../node_modules/.prisma/client-mongo";

type ModelName = Uncapitalize<Exclude<keyof PrismaClientMongo, `$${string}` | symbol>>;

export class BaseMongoRepository<T> {
    protected prisma: PrismaClientMongo;
    protected modelName: ModelName;

    constructor(modelName: ModelName) {
        this.prisma = new PrismaClientMongo({
            transactionOptions: {
                maxWait: 2000,
                timeout: 5000,
            },
        });
        this.modelName = modelName;
    }

    protected get model() {
        return (this.prisma as any)[this.modelName];
    }

    /**
     * Find all documents
     */
    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }

    /**
     * Find document by ID
     */
    async findById(id: string): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    /**
     * Create new document
     */
    async create(data: any): Promise<T> {
        return this.model.create({ data });
    }

    /**
     * Update document by ID
     */
    async update(id: string, data: any): Promise<T> {
        return this.model.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete document by ID
     */
    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    /**
     * Check if document exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.model.count({ where: { id } });
        return count > 0;
    }

    /**
     * Count documents
     */
    async count(where?: any): Promise<number> {
        return this.model.count({ where });
    }
}