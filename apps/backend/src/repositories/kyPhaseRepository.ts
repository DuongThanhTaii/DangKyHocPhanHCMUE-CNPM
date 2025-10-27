import type { ky_phase, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class KyPhaseRepository extends BaseRepository<ky_phase> {
    constructor(prisma: PrismaClient) {
        super(prisma, "ky_phase");
    }

    async findByHocKyAndPhase(hocKyId: string, phase: string): Promise<ky_phase | null> {
        return this.model.findUnique({
            where: {
                hoc_ky_id_phase: {
                    hoc_ky_id: hocKyId,
                    phase: phase,
                },
            },
        });
    }

    async findByHocKyId(hocKyId: string): Promise<ky_phase[]> {
        return this.model.findMany({
            where: {
                hoc_ky_id: hocKyId,
            },
            orderBy: {
                start_at: "asc",
            },
        });
    }

    async createMany(data: any[]): Promise<{ count: number }> {
        return this.model.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async deleteByHocKyId(hocKyId: string): Promise<{ count: number }> {
        return this.model.deleteMany({
            where: {
                hoc_ky_id: hocKyId,
            },
        });
    }

    async findOne(where: any): Promise<ky_phase | null> {
        return this.model.findFirst({ where });
    }

    async getCurrentPhase(hocKyId: string): Promise<ky_phase | null> {
        const now = new Date();
        return this.model.findFirst({
            where: {
                hoc_ky_id: hocKyId,
                start_at: { lte: now },
                end_at: { gte: now },
            },
        });
    }

    /**
     * Lấy phase đang enabled (is_enabled = true) theo học kỳ
     */
    async getPhaseEnabled(hocKyId: string): Promise<ky_phase | null> {
        return this.model.findFirst({
            where: {
                hoc_ky_id: hocKyId,
                is_enabled: true,
            },
            orderBy: {
                start_at: 'desc',
            },
        });
    }

    async findMany(params: {
        where?: any;
        orderBy?: any;
        take?: number;
        skip?: number;
    }): Promise<ky_phase[]> {
        return this.model.findMany(params);
    }
}