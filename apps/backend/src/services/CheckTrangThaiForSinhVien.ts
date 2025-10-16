import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";

export class CheckTrangThaiForSinhVien {
    constructor(private unitOfWork: UnitOfWork) { }

    async checkTrangThaiForGhiDanh(
        userId: string
    ): Promise<ServiceResult<null>> {
        try {
            const sinhVienKhoa = await this.unitOfWork.sinhVienRepository.findById(userId).then(sv => sv?.khoa_id);
            if (!sinhVienKhoa) {
                return ServiceResultBuilder.failure("Sinh viên không tồn tại hoặc chưa có khoa");
            }

            //check Phase if legit
            const currentHocKy = await this.unitOfWork.hocKyRepository.findHocKyHienHanh();
            if (!currentHocKy) {
                return ServiceResultBuilder.failure("Chưa có học kỳ hiện hành");
            }
            const currentPhase = await this.unitOfWork.kyPhaseRepository.getCurrentPhase(currentHocKy.id);
            if (!currentPhase) {
                return ServiceResultBuilder.failure("Chưa có giai đoạn hiện hành");
            }

            if (currentPhase.phase !== "ghi_danh") {
                return ServiceResultBuilder.failure("Chưa đến giai đoạn ghi danh");
            }

            //if ghi danh phase, check if sv's khoa is allowed
            const dotToanTruong = await this.unitOfWork.dotDangKyRepository.findToanTruongByHocKy(currentHocKy.id, "ghi_danh");
            if (dotToanTruong) {
                return ServiceResultBuilder.success("Đợt ghi danh toàn trường đang mở, sinh viên có thể ghi danh");
            }
            const dotTheoKhoa = await this.unitOfWork.dotDangKyRepository.isGhiDanhForKhoa(sinhVienKhoa, currentHocKy.id);
            if (dotTheoKhoa) {
                return ServiceResultBuilder.success("Đợt ghi danh theo khoa đang mở, sinh viên có thể ghi danh");
            }
            return ServiceResultBuilder.failure("Không có đợt ghi danh nào đang mở");
        } catch (error) {
            console.error("Error in checkTrangThaiForGhiDanh:", error);
            return ServiceResultBuilder.failure("Lỗi hệ thống, vui lòng thử lại sau");
        }
    }
}