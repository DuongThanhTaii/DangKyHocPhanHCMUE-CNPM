import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";

export class DanhMucService {
    private uow = UnitOfWork.getInstance();

    /**
     * Lấy danh sách khoa
     */
    async getAllKhoa(): Promise<ServiceResult<any[]>> {
        try {
            const khoas = await this.uow.khoaRepository.findAll();

            const data = khoas.map((k: any) => ({
                id: k.id,
                maKhoa: k.ma_khoa,
                tenKhoa: k.ten_khoa,
                ngayThanhLap: k.ngay_thanh_lap?.toISOString() || null,
                trangThaiHoatDong: k.trang_thai_hoat_dong,
            }));

            return ServiceResultBuilder.success("Lấy danh sách khoa thành công", data);
        } catch (error) {
            console.error("Error getting khoa:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách khoa", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy danh sách ngành học
     */
    async getAllNganh(khoa_id?: string): Promise<ServiceResult<any[]>> {
        try {
            const nganhs = khoa_id
                ? await this.uow.nganhHocRepository.findByKhoaId(khoa_id)
                : await this.uow.nganhHocRepository.findAllWithKhoa();

            const data = nganhs.map((n: any) => ({
                id: n.id,
                maNganh: n.ma_nganh,
                tenNganh: n.ten_nganh,
                khoaId: n.khoa_id,
                khoa: {
                    maKhoa: n.khoa.ma_khoa,
                    tenKhoa: n.khoa.ten_khoa,
                },
            }));

            return ServiceResultBuilder.success("Lấy danh sách ngành thành công", data);
        } catch (error) {
            console.error("Error getting nganh:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách ngành", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy danh sách cơ sở
     */
    async getAllCoSo(): Promise<ServiceResult<any[]>> {
        try {
            const coSos = await this.uow.client.co_so.findMany({
                orderBy: {
                    ten_co_so: "asc",
                },
            });

            const data = coSos.map((cs: any) => ({
                id: cs.id,
                tenCoSo: cs.ten_co_so,
                diaChi: cs.dia_chi,
            }));

            return ServiceResultBuilder.success("Lấy danh sách cơ sở thành công", data);
        } catch (error) {
            console.error("Error getting co so:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách cơ sở", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy danh sách ngành chưa có chính sách tín chỉ trong học kỳ (theo khoa)
     */
    async getNganhChuaCoChinhSach(hoc_ky_id: string, khoa_id: string): Promise<ServiceResult<any[]>> {
        try {
            // Lấy tất cả ngành của khoa
            const allNganhs = await this.uow.nganhHocRepository.findByKhoaId(khoa_id);

            // Lấy danh sách ngành đã có chính sách
            const nganhIdsWithPolicy = await this.uow.chinhSachTinChiRepository.getNganhIdsWithPolicy(hoc_ky_id, khoa_id);
            const nganhIdsSet = new Set(nganhIdsWithPolicy);

            // Filter ra các ngành chưa có chính sách
            const nganhsChuaCoChinhSach = allNganhs.filter((n: any) => !nganhIdsSet.has(n.id));

            const data = nganhsChuaCoChinhSach.map((n: any) => ({
                id: n.id,
                maNganh: n.ma_nganh,
                tenNganh: n.ten_nganh,
            }));

            return ServiceResultBuilder.success("Lấy danh sách ngành thành công", data);
        } catch (error) {
            console.error("Error getting nganh chua co chinh sach:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy danh sách ngành", "INTERNAL_ERROR");
        }
    }
}
