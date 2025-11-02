import { KyPhase } from "../../../../domain/entities/KyPhase.entity";

export interface CreateKyPhaseData {
    // ✅ Remove id field - Prisma auto-generates
    hocKyId: string;
    phase: string;
    startAt: Date;
    endAt: Date;
    isEnabled: boolean;
}

export interface IKyPhaseRepository {
    findByHocKyId(hocKyId: string): Promise<KyPhase[]>;
    findByHocKyIdAndPhase(hocKyId: string, phase: string): Promise<KyPhase | null>;
    createMany(phases: CreateKyPhaseData[]): Promise<void>;
    deleteByHocKyId(hocKyId: string): Promise<void>;
}

export const IKyPhaseRepository = Symbol.for("PdtQuanLyHocKy.IKyPhaseRepository");
