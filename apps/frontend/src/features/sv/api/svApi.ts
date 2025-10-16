import type { ServiceResult } from "../../common/ServiceResult";
import type {
    MonHocGhiDanhForSinhVien,
    RequestGhiDanhMonHoc,
    RequestHuyGhiDanhMonHoc,
    MonHocDaGhiDanh,
} from "../types";
import { fetchJSON } from "../../../utils/fetchJSON";

export const svApi = {
    /**
     * Lấy danh sách môn học có thể ghi danh
     */
    getMonHocGhiDanh: async (): Promise<ServiceResult<MonHocGhiDanhForSinhVien[]>> => {
        return await fetchJSON("sv/mon-hoc-ghi-danh", {
            method: "GET",
        });
    },

    /**
     * ✅ Ghi danh 1 môn học
     */
    ghiDanhMonHoc: async (data: RequestGhiDanhMonHoc): Promise<ServiceResult<null>> => {
        return await fetchJSON("sv/ghi-danh", {
            method: "POST",
            body: data,
        });
    },

    /**
     * ✅ Hủy ghi danh nhiều môn học
     */
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
};
