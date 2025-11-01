import { injectable, inject } from "inversify";
import { ITuitionRepository } from "../../ports/tuition/ITuitionRepository";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";
import { TuitionDetailDTO } from "../../dtos/tuition/TuitionDetailDTO";
@injectable()
export class GetTuitionDetailsUseCase {
    constructor(
        @inject(ITuitionRepository) private tuitionRepo: ITuitionRepository
    ) { }

    async execute(sinhVienId: string, hocKyId: string): Promise<ServiceResult<TuitionDetailDTO>> {
        try {
            // ✅ Gọi repo, repo sẽ check học phí tồn tại trước
            const chiTietHocPhi = await this.tuitionRepo.getChiTietHocPhi(sinhVienId, hocKyId);

            // ❌ Nếu null → học phí chưa được tính
            if (!chiTietHocPhi) {
                return ServiceResultBuilder.failure("Học phí chưa được tính. Vui lòng quay lại sau.", "NOT_FOUND");
            }

            return ServiceResultBuilder.success("Lấy thông tin học phí thành công", chiTietHocPhi);
        } catch (error: any) {
            console.error("[GET_TUITION_DETAILS] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi lấy thông tin học phí");
        }
    }
}
