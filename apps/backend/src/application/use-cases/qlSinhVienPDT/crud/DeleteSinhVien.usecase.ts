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
            // Step 1: Find sinh vien
            const sinhVien = await this.unitOfWork.getSinhVienRepository().findById(id);

            if (!sinhVien) {
                return ServiceResultBuilder.failure("Không tìm thấy sinh viên", "SINH_VIEN_NOT_FOUND");
            }

            // Step 2: Get tai_khoan_id (for cascade delete)
            const usersRepo = this.unitOfWork.getSinhVienRepository();
            const user = await this.unitOfWork.transaction(async (repos) => {
                return repos.usersRepo.findById(id);
            });

            if (!user) {
                return ServiceResultBuilder.failure("Không tìm thấy thông tin người dùng", "USER_NOT_FOUND");
            }

            // Step 3: Delete tai_khoan (cascade delete users → sinh_vien)
            await this.unitOfWork.transaction(async (repos) => {
                await repos.taiKhoanRepo.delete(user.taiKhoanId);
            });

            return ServiceResultBuilder.success("Xóa sinh viên thành công");
        } catch (error: any) {
            console.error("[DeleteSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi xóa sinh viên",
                "DELETE_FAILED"
            );
        }
    }
}
