import type { ServiceResult } from "../../common/ServiceResult";
import type {
    MonHocGhiDanhForSinhVien,
    RequestGhiDanhMonHoc
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
     * ✅ Hủy ghi danh 1 môn học
     */
    huyGhiDanhMonHoc: async (id: string): Promise<ServiceResult<null>> => {
        return await fetchJSON(`sv/ghi-danh/${id}`, {
            method: "DELETE",
        });
    },

    getDanhSachDaGhiDanh: async (): Promise<ServiceResult<MonHocGhiDanhForSinhVien[]>> => {
        return await fetchJSON("sv/ghi-danh/my", {
            method: "GET",
        });
    },
};
