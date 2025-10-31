import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";

export class ChinhSachTinChiService {
    private uow = UnitOfWork.getInstance();

    /**
     * Lấy danh sách tất cả chính sách tín chỉ
     */
    async getAllChinhSach(): Promise<ServiceResult<any[]>> {
        try {
            const chinhSachs = await this.uow.chinhSachTinChiRepository.findAllWithRelations();

            const data = chinhSachs.map((cs: any) => ({
                id: cs.id,
                hocKy: cs.hoc_ky
                    ? {
                        tenHocKy: cs.hoc_ky.ten_hoc_ky,
                        maHocKy: cs.hoc_ky.ma_hoc_ky,
                    }
                    : null,
                khoa: cs.khoa
                    ? {
                        tenKhoa: cs.khoa.ten_khoa,
                    }
                    : null,
                nganhHoc: cs.nganh_hoc
                    ? {
                        tenNganh: cs.nganh_hoc.ten_nganh,
                    }
                    : null,
                phiMoiTinChi: parseFloat(cs.phi_moi_tin_chi.toString()),
                ngayHieuLuc: cs.ngay_hieu_luc?.toISOString() || null,
                ngayHetHieuLuc: cs.ngay_het_hieu_luc?.toISOString() || null,
            }));

            return ServiceResultBuilder.success("Lấy danh sách chính sách thành công", data);
        } catch (error) {
            console.error("Error getting chinh sach:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách chính sách", "INTERNAL_ERROR");
        }
    }

    /**
     * Tạo chính sách tín chỉ mới
     */
    async createChinhSach(data: {
        hocKyId: string;
        khoaId?: string | null;
        nganhId?: string | null;
        phiMoiTinChi: number;
    }): Promise<ServiceResult<any>> {
        try {
            // Validate
            if (!data.hocKyId) {
                return ServiceResultBuilder.failure("Thiếu học kỳ ID", "MISSING_HOC_KY_ID");
            }

            if (!data.nganhId) {
                return ServiceResultBuilder.failure("Thiếu ngành ID", "MISSING_NGANH_ID");
            }

            if (data.phiMoiTinChi <= 0) {
                return ServiceResultBuilder.failure("Phí tín chỉ phải lớn hơn 0", "INVALID_PHI_TIN_CHI");
            }

            // Lấy thông tin ngành để lấy khoa_id
            const nganh = await this.uow.nganhHocRepository.findById(data.nganhId);

            if (!nganh) {
                return ServiceResultBuilder.failure("Ngành không tồn tại", "NGANH_NOT_FOUND");
            }

            // ✅ Check trùng lặp với khoa_id và nganh_id
            const existing = await this.uow.chinhSachTinChiRepository.checkExists({
                hoc_ky_id: data.hocKyId,
                khoa_id: nganh.khoa_id,
                nganh_id: data.nganhId,
            });

            if (existing) {
                return ServiceResultBuilder.failure(
                    "Chính sách tín chỉ đã tồn tại cho ngành này trong học kỳ",
                    "DUPLICATE_POLICY"
                );
            }

            // Lấy thông tin học kỳ
            const hocKy = await this.uow.hocKyRepository.findById(data.hocKyId);

            if (!hocKy) {
                return ServiceResultBuilder.failure("Học kỳ không tồn tại", "HOC_KY_NOT_FOUND");
            }

            if (!hocKy.ngay_bat_dau || !hocKy.ngay_ket_thuc) {
                return ServiceResultBuilder.failure(
                    "Học kỳ chưa có ngày bắt đầu hoặc kết thúc",
                    "INVALID_HOC_KY_DATE"
                );
            }

            // Create với khoa_id từ ngành
            const chinhSach = await this.uow.chinhSachTinChiRepository.createChinhSach({
                hoc_ky_id: data.hocKyId,
                khoa_id: nganh.khoa_id,
                nganh_id: data.nganhId,
                phi_moi_tin_chi: data.phiMoiTinChi,
                ngay_hieu_luc: hocKy.ngay_bat_dau,
                ngay_het_hieu_luc: hocKy.ngay_ket_thuc,
            });

            // Map DTO
            const result = {
                id: chinhSach.id,
                hocKy: chinhSach.hoc_ky
                    ? {
                        tenHocKy: chinhSach.hoc_ky.ten_hoc_ky,
                        maHocKy: chinhSach.hoc_ky.ma_hoc_ky,
                    }
                    : null,
                khoa: chinhSach.khoa
                    ? {
                        tenKhoa: chinhSach.khoa.ten_khoa,
                    }
                    : null,
                nganhHoc: chinhSach.nganh_hoc
                    ? {
                        tenNganh: chinhSach.nganh_hoc.ten_nganh,
                    }
                    : null,
                phiMoiTinChi: parseFloat(chinhSach.phi_moi_tin_chi.toString()),
                ngayHieuLuc: chinhSach.hoc_ky?.ngay_bat_dau?.toISOString() || null,
                ngayHetHieuLuc: chinhSach.hoc_ky?.ngay_ket_thuc?.toISOString() || null,
            };

            return ServiceResultBuilder.success("Tạo chính sách thành công", result);
        } catch (error) {
            console.error("Error creating chinh sach:", error);
            return ServiceResultBuilder.failure("Lỗi khi tạo chính sách", "INTERNAL_ERROR");
        }
    }

    /**
     * Cập nhật phí tín chỉ
     */
    async updatePhiTinChi(id: string, phiMoiTinChi: number): Promise<ServiceResult<any>> {
        try {
            // Validate
            if (!id) {
                return ServiceResultBuilder.failure("Thiếu ID chính sách", "MISSING_ID");
            }

            if (phiMoiTinChi <= 0) {
                return ServiceResultBuilder.failure("Phí tín chỉ phải lớn hơn 0", "INVALID_PHI_TIN_CHI");
            }

            // Check chính sách tồn tại
            const existing = await this.uow.chinhSachTinChiRepository.findById(id);

            if (!existing) {
                return ServiceResultBuilder.failure("Chính sách không tồn tại", "NOT_FOUND");
            }

            // Update
            const updated = await this.uow.chinhSachTinChiRepository.updatePhiTinChi(id, phiMoiTinChi);

            // Map DTO
            const result = {
                id: updated.id,
                hocKy: updated.hoc_ky
                    ? {
                        tenHocKy: updated.hoc_ky.ten_hoc_ky,
                        maHocKy: updated.hoc_ky.ma_hoc_ky,
                    }
                    : null,
                khoa: updated.khoa
                    ? {
                        tenKhoa: updated.khoa.ten_khoa,
                    }
                    : null,
                nganhHoc: updated.nganh_hoc
                    ? {
                        tenNganh: updated.nganh_hoc.ten_nganh,
                    }
                    : null,
                phiMoiTinChi: parseFloat(updated.phi_moi_tin_chi.toString()),
                ngayHieuLuc: updated.hoc_ky?.ngay_bat_dau?.toISOString() || null,
                ngayHetHieuLuc: updated.hoc_ky?.ngay_ket_thuc?.toISOString() || null,
            };

            return ServiceResultBuilder.success("Cập nhật phí tín chỉ thành công", result);
        } catch (error) {
            console.error("Error updating phi tin chi:", error);
            return ServiceResultBuilder.failure("Lỗi khi cập nhật phí tín chỉ", "INTERNAL_ERROR");
        }
    }
}
