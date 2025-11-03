import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/hocKyPublic/IUnitOfWork";
import { UpdateHocKyDatesInputDTO } from "../../dtos/hocKyPublic/UpdateHocKyDates.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class UpdateHocKyDatesUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(input: UpdateHocKyDatesInputDTO): Promise<ServiceResult<null>> {
        try {
            const hocKy = await this.unitOfWork.getHocKyRepository().findById(input.hocKyId);
            if (!hocKy) {
                return ServiceResultBuilder.failure("Không tìm thấy học kỳ", "HOC_KY_NOT_FOUND");
            }

            // ✅ Convert string → Date here
            const ngayBatDau = new Date(input.ngayBatDau);
            const ngayKetThuc = new Date(input.ngayKetThuc);

            await this.unitOfWork.getHocKyRepository().updateDates(
                input.hocKyId,
                ngayBatDau,
                ngayKetThuc
            );

            return ServiceResultBuilder.success("Cập nhật ngày bắt đầu/kết thúc thành công", null);
        } catch (error: any) {
            console.error("[UpdateHocKyDatesUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi cập nhật ngày học kỳ",
                "UPDATE_HOC_KY_DATES_FAILED"
            );
        }
    }
}
