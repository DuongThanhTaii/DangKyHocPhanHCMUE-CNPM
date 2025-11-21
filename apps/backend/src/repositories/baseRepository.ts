import { PrismaClient } from "@prisma/client";

export abstract class BaseRepository<T> {
    protected modelName: string;

    constructor(
        protected prisma: PrismaClient,
        modelName: string
    ) {
        this.modelName = modelName;
    }

    protected get model() {
        return (this.prisma as any)[this.modelName];
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }

    async findById(id: string): Promise<T | null> {
        // ✅ ADD: Guard clause
        if (!id || typeof id !== 'string') {
            console.error(`[BaseRepository.findById] Invalid id:`, id);
            return null; // or throw new Error("Invalid ID")
        }

        return this.model.findUnique({
            where: { id } as any,
        }) as Promise<T | null>;
    }

    async create(data: any): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: string, data: any): Promise<T> {
        return this.model.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.model.count({ where: { id } });
        return count > 0;
    }
}