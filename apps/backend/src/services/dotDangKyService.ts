import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { DotGhiDanhResponseDTO } from "../dtos/dotDangKyDTO";

export class DotDangKyService {
    constructor(private unitOfWork: UnitOfWork) { }

    /**
     * Lấy tất cả đợt đăng ký theo học kỳ
     * @param hocKyId - ID của học kỳ
     */
    async getAllDotDangKyByHocKy(
        hocKyId: string
    ): Promise<ServiceResult<DotGhiDanhResponseDTO[]>> {
        try {
            // Kiểm tra học kỳ tồn tại
            const hocKy = await this.unitOfWork.hocKyRepository.findById(hocKyId);
            if (!hocKy) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy học kỳ",
                    "HOC_KY_NOT_FOUND"
                );
            }

            // Lấy tất cả đợt đăng ký của học kỳ (với thông tin khoa)
            const dotDangKyList = await this.unitOfWork.dotDangKyRepository.findByHocKyWithKhoa(
                hocKyId,
                "ghi_danh" // Chỉ lấy đợt ghi danh
            );

            // Map sang DTO
            const data: DotGhiDanhResponseDTO[] = dotDangKyList.map((item: any) => ({
                id: item.id,
                hocKyId: item.hoc_ky_id,
                loaiDot: item.loai_dot,
                thoiGianBatDau: new Date(item.thoi_gian_bat_dau).toISOString(),
                thoiGianKetThuc: new Date(item.thoi_gian_ket_thuc).toISOString(),
                isCheckToanTruong: item.is_check_toan_truong,
                khoaId: item.khoa_id,
                tenKhoa: item.khoa?.ten_khoa || null,
                gioiHanTinChi: item.gioi_han_tin_chi,
            }));

            return ServiceResultBuilder.success(
                `Lấy thành công ${data.length} đợt đăng ký`,
                data
            );
        } catch (error) {
            console.error("Error getting all dot dang ky by hoc ky:", error);
            return ServiceResultBuilder.failure(
                "Lỗi hệ thống khi lấy danh sách đợt đăng ký",
                "INTERNAL_ERROR"
            );
        }
    }
}