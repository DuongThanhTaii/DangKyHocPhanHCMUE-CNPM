import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../../common/ServiceResult";
import type { TuChoiDeXuatHocPhanRequest } from "../../common/types"; // ✅ Import shared type
import type {
    DeXuatHocPhanForTruongKhoaDTO,
    UpdateTrangThaiByTruongKhoaRequest,
} from "../types";

export const tkApi = {
    /**
     * Lấy danh sách đề xuất học phần cho Trưởng Khoa
     */
    getDeXuatHocPhan: async (): Promise<ServiceResult<DeXuatHocPhanForTruongKhoaDTO[]>> => {
        return await fetchJSON("tk/de-xuat-hoc-phan", {
            method: "GET",
        });
    },

    /**
     * ✅ Duyệt đề xuất học phần
     */
    duyetDeXuatHocPhan: async (
        data: UpdateTrangThaiByTruongKhoaRequest
    ): Promise<ServiceResult<null>> => {
        return await fetchJSON("tk/de-xuat-hoc-phan/duyet", {
            method: "PATCH",
            body: data,
        });
    },

    /**
     * ✅ Từ chối đề xuất học phần (shared endpoint)
     */
    tuChoiDeXuatHocPhan: async (
        data: TuChoiDeXuatHocPhanRequest
    ): Promise<ServiceResult<null>> => {
        return await fetchJSON("tk/de-xuat-hoc-phan/tu-choi", {
            method: "PATCH",
            body: data,
        });
    },
};