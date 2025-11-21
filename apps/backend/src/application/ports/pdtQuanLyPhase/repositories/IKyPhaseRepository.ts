import { KyPhase } from "../../../../domain/entities/pdtQuanLyPhase/KyPhase.entity";

export interface IKyPhaseRepository {
    /**
     * Find phase by ID
     */
    findById(id: string): Promise<KyPhase | null>;

    /**
     * ✅ NEW: Find phase by học kỳ ID + phase name
     */
    findByHocKyAndPhase(hocKyId: string, phase: string): Promise<KyPhase | null>;

    /**
     * Get all phases by học kỳ ID
     */
    findByHocKyId(hocKyId: string): Promise<KyPhase[]>;

    /**
     * Update phase (toggle is_enabled)
     */
    update(phase: KyPhase): Promise<void>;
}
