import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../ServiceResult";
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
};
