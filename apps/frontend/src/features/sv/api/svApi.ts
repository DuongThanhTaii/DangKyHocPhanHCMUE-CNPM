import type { ServiceResult } from "../../common/ServiceResult";
import type {
    MonHocGhiDanhForSinhVien,
    RequestGhiDanhMonHoc,
    RequestHuyGhiDanhMonHoc,
    MonHocDaGhiDanh,
    CheckPhaseDangKyResponse,
    DanhSachLopHocPhanDTO,
    DanhSachLopDaDangKyDTO,
    DangKyHocPhanRequest,
    HuyDangKyHocPhanRequest,
    ChuyenLopHocPhanRequest,
    LopHocPhanItemDTO,
    SVTKBWeeklyItemDTO,
} from "../types";
import { fetchJSON } from "../../../utils/fetchJSON";
import type { LichSuDangKyDTO } from "../types";
import type { MonHocTraCuuDTO } from "../types";
export const svApi = {
    // ========== GHI DANH ==========

    getMonHocGhiDanh: async (): Promise<ServiceResult<MonHocGhiDanhForSinhVien[]>> => {
        return await fetchJSON("sv/mon-hoc-ghi-danh", {
            method: "GET",
        });
    },

    ghiDanhMonHoc: async (data: RequestGhiDanhMonHoc): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/ghi-danh", {
            method: "POST",
            body: data,
        });
    },

    huyGhiDanhMonHoc: async (data: RequestHuyGhiDanhMonHoc): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/ghi-danh", {
            method: "DELETE",
            body: data,
        });
    },

    getDanhSachDaGhiDanh: async (): Promise<ServiceResult<MonHocDaGhiDanh[]>> => {
        return await fetchJSON("sv/ghi-danh/my", {
            method: "GET",
        });
    },

    checkTrangThaiGhiDanh: async (): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/check-ghi-danh", {
            method: "GET",
        });
    },

    // ========== ĐĂNG KÝ HỌC PHẦN ==========

    checkPhaseDangKy: async (hocKyId: string): Promise<ServiceResult<null>> => {
        return await fetchJSON(`sv/check-phase-dang-ky?hoc_ky_id=${hocKyId}`);
    },

    getDanhSachLopHocPhan: async (hocKyId: string): Promise<ServiceResult<DanhSachLopHocPhanDTO>> => {
        return await fetchJSON(`sv/lop-hoc-phan?hoc_ky_id=${hocKyId}`);
    },

    getLopDaDangKy: async (hocKyId: string): Promise<ServiceResult<DanhSachLopDaDangKyDTO>> => {
        return await fetchJSON(`sv/lop-da-dang-ky?hoc_ky_id=${hocKyId}`);
    },

    dangKyLopHocPhan: async (data: DangKyHocPhanRequest): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/dang-ky-hoc-phan", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Hủy đăng ký học phần (1 lớp)
     */
    huyDangKyLopHocPhan: async (data: HuyDangKyHocPhanRequest): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/huy-dang-ky-hoc-phan", {
            method: "POST", // ✅ Backend uses POST
            body: data,
        });
    },

    /**
     * ✅ Chuyển lớp học phần
     */
    chuyenLopHocPhan: async (data: ChuyenLopHocPhanRequest): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/chuyen-lop-hoc-phan", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Load danh sách lớp chưa đăng ký theo môn (để chuyển lớp)
     */
    getLopChuaDangKyByMonHoc: async (
        monHocId: string,
        hocKyId: string
    ): Promise<ServiceResult<LopHocPhanItemDTO[]>> => {
        return await fetchJSON(`sv/lop-hoc-phan/mon-hoc?mon_hoc_id=${monHocId}&hoc_ky_id=${hocKyId}`);
    },

    /**
     * ✅ Lấy lịch sử đăng ký theo học kỳ
     */
    getLichSuDangKy: async (hocKyId: string): Promise<ServiceResult<LichSuDangKyDTO>> => {
        return await fetchJSON(`sv/lich-su-dang-ky?hoc_ky_id=${hocKyId}`, {
            method: "GET",
        });
    },

    /**
     * ✅ Lấy TKB theo tuần (sinh viên)
     */
    getTKBWeekly: async (
        hocKyId: string,
        dateStart: string, // YYYY-MM-DD
        dateEnd: string    // YYYY-MM-DD
    ): Promise<ServiceResult<SVTKBWeeklyItemDTO[]>> => {
        return await fetchJSON(
            `sv/tkb-weekly?hoc_ky_id=${hocKyId}&date_start=${dateStart}&date_end=${dateEnd}`
        );
    },

    /**
     * ✅ Tra cứu học phần theo học kỳ
     */
    traCuuHocPhan: async (
        hocKyId: string
    ): Promise<ServiceResult<MonHocTraCuuDTO[]>> => {
        return await fetchJSON(`sv/tra-cuu-hoc-phan?hoc_ky_id=${hocKyId}`);
    },
};
