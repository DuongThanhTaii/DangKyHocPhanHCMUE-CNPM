import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../ServiceResult";
import type { NganhDTO } from "../types";
import type { HocKyNienKhoaDTO, HocKyHienHanhDTO } from "../types";

/**
 * ✅ Common API - Public endpoints (Auth required, all roles)
 */
export const commonApi = {
    /**
     * ✅ Lấy học kỳ hiện hành (public, auth required)
     */
    getHocKyHienHanh: async (): Promise<ServiceResult<HocKyHienHanhDTO>> => {
        return await fetchJSON("hoc-ky-hien-hanh", {
            method: "GET",
        });
    },

    /**
     * ✅ Lấy danh sách học kỳ kèm niên khóa (public, auth required)
     */
    getHocKyNienKhoa: async (): Promise<ServiceResult<HocKyNienKhoaDTO[]>> => {
        return await fetchJSON("hoc-ky-nien-khoa", {
            method: "GET",
        });
    },

    /**
     * ✅ Lấy danh sách ngành (có thể filter theo khoa_id)
     */
    getDanhSachNganh: async (khoaId?: string): Promise<ServiceResult<NganhDTO[]>> => {
        const url = khoaId
            ? `dm/nganh?khoa_id=${khoaId}`
            : "dm/nganh";

        return await fetchJSON(url, {
            method: "GET",
        });
    },

    /**
     * ✅ Cập nhật ngày bắt đầu và kết thúc học kỳ
     */
    updateHocKyDate: async (data: {
        hocKyId: string;
        ngayBatDau: string;
        ngayKetThuc: string;
    }): Promise<ServiceResult<null>> => {
        return await fetchJSON("hoc-ky/dates", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
};
