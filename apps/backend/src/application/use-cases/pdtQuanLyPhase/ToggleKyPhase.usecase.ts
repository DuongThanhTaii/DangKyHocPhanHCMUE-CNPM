import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/di/types";
import { IKyPhaseRepository } from "../../ports/pdtQuanLyPhase/repositories/IKyPhaseRepository";
import { IHocKyRepository } from "../../ports/pdtQuanLyPhase/repositories/IHocKyRepository";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

interface ToggleKyPhaseOutputDTO {
  phaseId: string;
  phase: string;
  hocKyId: string;
  isEnabled: boolean;
}

@injectable()
export class ToggleKyPhaseUseCase {
  constructor(
    @inject(TYPES.PdtQuanLyPhase.IKyPhaseRepository) private kyPhaseRepo: IKyPhaseRepository,
    @inject(TYPES.PdtQuanLyPhase.IHocKyRepository) private hocKyRepo: IHocKyRepository
  ) {}

  /**
   * ✅ Execute: Toggle phase by phase name (in học kỳ hiện hành)
   */
  async execute(phaseName: string): Promise<ServiceResult<ToggleKyPhaseOutputDTO>> {
    try {
      // Step 1: Lấy học kỳ hiện hành
      const hocKyHienHanh = await this.hocKyRepo.findHocKyHienHanh();
      if (!hocKyHienHanh) {
        return ServiceResultBuilder.failure(
          "Không có học kỳ hiện hành",
          "NO_HOC_KY_HIEN_HANH"
        );
      }

      // Step 2: Find phase by hoc_ky_id + phase name
      const targetPhase = await this.kyPhaseRepo.findByHocKyAndPhase(
        hocKyHienHanh.id,
        phaseName
      );

      if (!targetPhase) {
        return ServiceResultBuilder.failure(
          `Không tìm thấy phase "${phaseName}" trong học kỳ hiện hành`,
          "PHASE_NOT_FOUND"
        );
      }

      // ✅ NEW LOGIC: Set target phase = true, tất cả phase khác = false

      // Step 3: Get all phases của học kỳ hiện hành
      const allPhases = await this.kyPhaseRepo.findByHocKyId(hocKyHienHanh.id);

      // Step 4: Update ALL phases (atomic operation)
      for (const phase of allPhases) {
        if (phase.id === targetPhase.id) {
          // ✅ Set target phase = true
          phase.isEnabled = true;
        } else {
          // ✅ Set other phases = false
          phase.isEnabled = false;
        }
        await this.kyPhaseRepo.update(phase);
      }

      // Step 5: Return result
      const output: ToggleKyPhaseOutputDTO = {
        phaseId: targetPhase.id,
        phase: targetPhase.phase,
        hocKyId: targetPhase.hocKyId,
        isEnabled: true, // Always true for target phase
      };

      return ServiceResultBuilder.success(
        `Đã BẬT phase "${phaseName}" và TẮT tất cả phase khác`,
        output
      );
    } catch (error: any) {
      console.error("[ToggleKyPhaseUseCase] Error:", error);
      return ServiceResultBuilder.failure(
        error.message || "Lỗi khi toggle phase",
        "TOGGLE_FAILED"
      );
    }
  }
}
