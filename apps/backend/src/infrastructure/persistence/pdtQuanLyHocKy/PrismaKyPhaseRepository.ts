import { PrismaClient, Prisma } from "@prisma/client";
import { IKyPhaseRepository, CreateKyPhaseData } from "../../../application/ports/pdtQuanLyHocKy/repositories/IKyPhaseRepository";
import { KyPhase } from "../../../domain/entities/KyPhase.entity";

export class PrismaKyPhaseRepository implements IKyPhaseRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findByHocKyId(hocKyId: string): Promise<KyPhase[]> {
        const records = await this.db.ky_phase.findMany({
            where: { hoc_ky_id: hocKyId },
            orderBy: { start_at: "asc" },
        });

        return records.map((r) => this.toDomain(r));
    }

    async findByHocKyIdAndPhase(hocKyId: string, phase: string): Promise<KyPhase | null> {
        const record = await this.db.ky_phase.findUnique({
            where: {
                hoc_ky_id_phase: {
                    hoc_ky_id: hocKyId,
                    phase: phase,
                },
            },
        });

        return record ? this.toDomain(record) : null;
    }

    async createMany(phases: CreateKyPhaseData[]): Promise<void> {
        await this.db.ky_phase.createMany({
            data: phases.map((p) => ({
                // ✅ No id field - Prisma auto-generates with uuid_generate_v4()
                hoc_ky_id: p.hocKyId,
                phase: p.phase,
                start_at: p.startAt,
                end_at: p.endAt,
                is_enabled: p.isEnabled,
            })),
        });
    }

    async deleteByHocKyId(hocKyId: string): Promise<void> {
        await this.db.ky_phase.deleteMany({
            where: { hoc_ky_id: hocKyId },
        });
    }

    private toDomain(record: any): KyPhase {
        return KyPhase.fromPersistence({
            id: record.id,
            hocKyId: record.hoc_ky_id,
            phase: record.phase,
            startAt: record.start_at,
            endAt: record.end_at,
            isEnabled: record.is_enabled,
        });
    }
}
