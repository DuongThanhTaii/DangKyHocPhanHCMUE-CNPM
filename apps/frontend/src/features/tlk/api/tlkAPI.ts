import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../../common/ServiceResult";
import type { DeXuatHocPhanRequest } from "../types";


export const tlkAPI = {
    /**
     * Tạo đề xuất học phần
     */
    createDeXuatHocPhan: async (data: DeXuatHocPhanRequest): Promise<ServiceResult<null>> => {
        return await fetchJSON("tlk/de-xuat-hoc-phan", {
            method: "POST",
            body: data,
        });
    }
}