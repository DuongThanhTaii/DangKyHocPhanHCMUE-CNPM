import { fetchJSON } from "../../../utils/fetchJSON";
import type { ServiceResult } from "../../common/ServiceResult";
import type { TKBWeeklyItemDTO, TietHoc } from "../types";

export const gvAPI = {
    /**
     * Lấy TKB theo khoảng ngày (tuần)
     */
    getTKBWeekly: async (
        hocKyId: string,
        dateStart: string, // YYYY-MM-DD
        dateEnd: string    // YYYY-MM-DD
    ): Promise<ServiceResult<TKBWeeklyItemDTO[]>> => {
        return await fetchJSON(
            `gv/tkb-weekly?hoc_ky_id=${hocKyId}&date_start=${dateStart}&date_end=${dateEnd}`
        );
    },

    /**
     * Lấy config tiết học
     */
    getTietHocConfig: async (): Promise<ServiceResult<TietHoc[]>> => {
        return await fetchJSON("config/tiet-hoc");
    },
};