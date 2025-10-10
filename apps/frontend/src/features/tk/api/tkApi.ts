import type { ServiceResult } from "../../common/ServiceResult";
import type { DeXuatHocPhanForTruongKhoaDTO, UpdateTrangThaiByTruongKhoaRequest } from "../types";
import { fetchJSON } from "../../../utils/fetchJSON";

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
     *  Duyệt đề xuất học phần
     */
    duyetDeXuatHocPhan: async (
        data: UpdateTrangThaiByTruongKhoaRequest
    ): Promise<ServiceResult<null>> => {
        return await fetchJSON("tk/de-xuat-hoc-phan/duyet", {
            method: "PATCH",
            body: data,
        });
    },
};