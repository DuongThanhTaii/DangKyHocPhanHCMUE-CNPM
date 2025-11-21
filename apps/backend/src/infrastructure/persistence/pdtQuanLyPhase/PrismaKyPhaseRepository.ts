import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IKyPhaseRepository } from "../../../application/ports/pdtQuanLyPhase/repositories/IKyPhaseRepository";
import { KyPhase } from "../../../domain/entities/pdtQuanLyPhase/KyPhase.entity";

@injectable()
export class PrismaKyPhaseRepository implements IKyPhaseRepository {
    constructor(private prisma: PrismaClient) { }

    async findById(id: string): Promise<KyPhase | null> {
        const record = await this.prisma.ky_phase.findUnique({
            where: { id },
        });

        if (!record) return null;

        return KyPhase.fromPersistence({
            id: record.id,
            hocKyId: record.hoc_ky_id,
            phase: record.phase,
            startAt: record.start_at,
            endAt: record.end_at,
            isEnabled: record.is_enabled ?? true,
        });
    }

    async findByHocKyId(hocKyId: string): Promise<KyPhase[]> {
        const records = await this.prisma.ky_phase.findMany({
            where: { hoc_ky_id: hocKyId },
            orderBy: { phase: "asc" },
        });

        return records.map((r) =>
            KyPhase.fromPersistence({
                id: r.id,
                hocKyId: r.hoc_ky_id,
                phase: r.phase,
                startAt: r.start_at,
                endAt: r.end_at,
                isEnabled: r.is_enabled ?? true,
            })
        );
    }

    async findByHocKyAndPhase(hocKyId: string, phase: string): Promise<KyPhase | null> {
        const record = await this.prisma.ky_phase.findUnique({
            where: {
                // ✅ Use compound unique index (hoc_ky_id + phase)
                hoc_ky_id_phase: {
                    hoc_ky_id: hocKyId,
                    phase,
                },
            },
        });

        if (!record) return null;

        return KyPhase.fromPersistence({
            id: record.id,
            hocKyId: record.hoc_ky_id,
            phase: record.phase,
            startAt: record.start_at,
            endAt: record.end_at,
            isEnabled: record.is_enabled ?? true,
        });
    }

    async update(phase: KyPhase): Promise<void> {
        await this.prisma.ky_phase.update({
            where: { id: phase.id },
            data: {
                is_enabled: phase.isEnabled,
                // NO update start_at, end_at, phase (immutable)
            },
        });
    }
}
