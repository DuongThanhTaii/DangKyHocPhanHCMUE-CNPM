import { injectable, inject } from "inversify";
import { ITaiLieuRepository } from "../../ports/sinhvien/ITaiLieuRepository";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";
import { LopDaDangKyWithTaiLieuDTO } from "../../dtos/sinhvien/TaiLieuDTO";

@injectable()
export class GetLopDaDangKyWithTaiLieuUseCase {
    constructor(
        @inject(ITaiLieuRepository) private taiLieuRepo: ITaiLieuRepository
    ) { }

    async execute(sinh_vien_id: string, hoc_ky_id: string): Promise<ServiceResult<LopDaDangKyWithTaiLieuDTO[]>> {
        try {
            const data = await this.taiLieuRepo.getLopDaDangKyWithTaiLieu(sinh_vien_id, hoc_ky_id);

            // Map sang DTO với file URL
            const result: LopDaDangKyWithTaiLieuDTO[] = data.map(lop => ({
                lopHocPhanId: lop.lopHocPhanId,
                maLop: lop.maLop,
                maMon: lop.maMon,
                tenMon: lop.tenMon,
                soTinChi: lop.soTinChi,
                giangVien: lop.giangVien,
                trangThaiDangKy: lop.trangThaiDangKy,
                ngayDangKy: lop.ngayDangKy,
                taiLieu: lop.taiLieu.map(tl => ({
                    id: tl.id,
                    tenTaiLieu: tl.ten_tai_lieu,
                    fileType: tl.file_type,
                    fileUrl: `${process.env.AWS_S3_BASE_URL}/${tl.file_path}`,
                    uploadedAt: tl.created_at,
                    uploadedBy: tl.uploader_name || "Giảng viên"
                }))
            }));

            if (result.length === 0) {
                return ServiceResultBuilder.success("Không có lớp nào đã đăng ký", []);
            }

            return ServiceResultBuilder.success("Lấy danh sách lớp đã đăng ký kèm tài liệu thành công", result);
        } catch (error: any) {
            console.error("[GET_LOP_DA_DANG_KY_WITH_TAI_LIEU] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi lấy danh sách lớp đã đăng ký kèm tài liệu");
        }
    }
}
