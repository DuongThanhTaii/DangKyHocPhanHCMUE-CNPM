import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../ports/hocKyPublic/IUnitOfWork";
import { HocKyNienKhoaOutputDTO } from "../../dtos/hocKyPublic/HocKyNienKhoaOutput.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class GetHocKyNienKhoaUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(): Promise<ServiceResult<HocKyNienKhoaOutputDTO[]>> {
        try {
            const [hocKyList, nienKhoaList] = await Promise.all([
                this.unitOfWork.getHocKyRepository().findAll(),
                this.unitOfWork.getNienKhoaRepository().findAll(),
            ]);

            // Group học kỳ theo niên khóa
            const grouped = nienKhoaList.map((nienKhoa) => ({
                nienKhoaId: nienKhoa.id,
                tenNienKhoa: nienKhoa.tenNienKhoa,
                hocKy: hocKyList
                    .filter((hk) => hk.nienKhoaId === nienKhoa.id)
                    .map((hk) => ({
                        id: hk.id,
                        tenHocKy: hk.tenHocKy,
                        maHocKy: hk.maHocKy,
                        // ✅ FIX: Return null if not exist (don't use || undefined)
                        ngayBatDau: hk.ngayBatDau ?? null,
                        ngayKetThuc: hk.ngayKetThuc ?? null,
                    })),
            }));

            return ServiceResultBuilder.success("Lấy danh sách học kỳ niên khóa thành công", grouped);
        } catch (error: any) {
            console.error("[GetHocKyNienKhoaUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy danh sách học kỳ niên khóa",
                "GET_HOC_KY_NIEN_KHOA_FAILED"
            );
        }
    }
}
