import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class DeleteSinhVienUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(id: string): Promise<ServiceResult<void>> {
        try {
            // Step 1: Get sinh vien with relations (outside transaction)
            const sinhVien = await this.unitOfWork.getSinhVienRepository().findById(id);
            if (!sinhVien) {
                return ServiceResultBuilder.failure("Không tìm thấy sinh viên", "SINH_VIEN_NOT_FOUND");
            }

            // Step 2: Get tai_khoan_id from DB
            const svRecord = await this.unitOfWork.getSinhVienRepository().findById(id);
            const taiKhoanId = svRecord?.taiKhoanId;

            if (!taiKhoanId) {
                return ServiceResultBuilder.failure("Sinh viên không có tài khoản liên kết", "NO_TAI_KHOAN");
            }

            // Step 3: Transaction (Prisma cascade delete)
            await this.unitOfWork.transaction(async (tx) => {
                // ✅ FIX: Use tx.tai_khoan (Prisma model)
                // Xóa tai_khoan sẽ cascade xóa users → cascade xóa sinh_vien
                await tx.tai_khoan.delete({ where: { id: taiKhoanId } });
            });

            return ServiceResultBuilder.success("Đã xóa tài khoản sinh viên");
        } catch (error: any) {
            console.error("[DeleteSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi xóa sinh viên",
                "DELETE_FAILED"
            );
        }
    }
}
