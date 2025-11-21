import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/pdtQuanLyHocKy/IUnitOfWork";
import { SetHocKyHienHanhInputDTO } from "../../dtos/pdtQuanLyHocKy/SetHocKyHienHanh.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class SetHocKyHienHanhUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(input: SetHocKyHienHanhInputDTO): Promise<ServiceResult<void>> {
        try {
            // Step 1: Check học kỳ exists
            const hocKy = await this.unitOfWork.getHocKyRepository().findById(input.hocKyId);

            if (!hocKy) {
                return ServiceResultBuilder.failure("Không tìm thấy học kỳ", "HOC_KY_NOT_FOUND");
            }

            // Step 2: Transaction - Unset all, then set new
            await this.unitOfWork.transaction(async (repos) => {
                // Unset all học kỳ hiện hành
                await repos.hocKyRepo.unsetAllHienHanh();

                // Set học kỳ mới là hiện hành
                await repos.hocKyRepo.setHienHanh(input.hocKyId);
            });

            return ServiceResultBuilder.success("Đã đặt học kỳ hiện hành thành công");
        } catch (error: any) {
            console.error("[SetHocKyHienHanhUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi đặt học kỳ hiện hành",
                "SET_HOC_KY_HIEN_HANH_FAILED"
            );
        }
    }
}
