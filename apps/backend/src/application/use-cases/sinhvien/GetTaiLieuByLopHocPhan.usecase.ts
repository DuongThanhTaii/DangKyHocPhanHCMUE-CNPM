import { injectable, inject } from "inversify";
import { ITaiLieuRepository } from "../../ports/sinhvien/ITaiLieuRepository";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";
import { TaiLieuDTO } from "../../dtos/sinhvien/TaiLieuDTO";

@injectable()
export class GetTaiLieuByLopHocPhanUseCase {
    constructor(
        @inject(ITaiLieuRepository) private taiLieuRepo: ITaiLieuRepository
    ) { }

    async execute(sinh_vien_id: string, lop_hoc_phan_id: string): Promise<ServiceResult<TaiLieuDTO[]>> {
        try {
            // Kiểm tra sinh viên có đăng ký lớp này không
            const isDangKy = await this.taiLieuRepo.checkSinhVienDangKyLop(sinh_vien_id, lop_hoc_phan_id);

            if (!isDangKy) {
                return ServiceResultBuilder.failure(
                    "Bạn chưa đăng ký lớp học phần này hoặc đã hủy đăng ký",
                    "NOT_REGISTERED"
                );
            }

            // Lấy tài liệu
            const data = await this.taiLieuRepo.findByLopHocPhanId(lop_hoc_phan_id);

            // Map sang DTO với file URL
            const result: TaiLieuDTO[] = data.map(tl => ({
                id: tl.id,
                tenTaiLieu: tl.ten_tai_lieu,
                fileType: tl.file_type,
                fileUrl: `${process.env.AWS_S3_BASE_URL}/${tl.file_path}`,
                uploadedAt: tl.created_at,
                uploadedBy: tl.uploader_name || "Giảng viên"
            }));

            return ServiceResultBuilder.success("Lấy danh sách tài liệu thành công", result);
        } catch (error: any) {
            console.error("[GET_TAI_LIEU_BY_LOP_HOC_PHAN] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi lấy danh sách tài liệu");
        }
    }
}
