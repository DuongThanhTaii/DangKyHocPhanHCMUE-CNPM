import { injectable, inject } from "inversify";
import { IUnitOfWork } from "../../../ports/qlSinhVienPDT/IUnitOfWork";
import { ListSinhVienQueryDTO, ListSinhVienOutputDTO } from "../../../dtos/qlSinhVienPDT/crud/ListSinhVien.dto";
import { ServiceResult, ServiceResultBuilder } from "../../../../types/serviceResult";

@injectable()
export class ListSinhVienUseCase {
    constructor(
        @inject(IUnitOfWork) private unitOfWork: IUnitOfWork
    ) { }

    async execute(query: ListSinhVienQueryDTO): Promise<ServiceResult<ListSinhVienOutputDTO>> {
        try {
            const page = query.page || 1;
            const pageSize = query.pageSize || 20;

            const result = await this.unitOfWork.getSinhVienRepository().findPaged({
                page,
                pageSize,
                search: query.search,
            });

            return ServiceResultBuilder.success("Lấy danh sách sinh viên thành công", {
                items: result.items.map((sv) => ({
                    id: sv.id,
                    maSoSinhVien: sv.maSoSinhVien,
                    hoTen: sv.hoTen,
                    tenKhoa: "", // Will be populated by repository
                    tenNganh: "",
                    lop: sv.lop || undefined,
                    khoaHoc: sv.khoaHoc || undefined,
                    trangThaiHoatDong: true,
                })),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
            });
        } catch (error: any) {
            console.error("[ListSinhVienUseCase] Error:", error);
            return ServiceResultBuilder.failure(
                error.message || "Lỗi khi lấy danh sách sinh viên",
                "LIST_FAILED"
            );
        }
    }
}
