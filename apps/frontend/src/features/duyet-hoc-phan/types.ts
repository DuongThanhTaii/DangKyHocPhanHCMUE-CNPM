import type { DeXuatHocPhanForTruongKhoaDTO } from "../tk/types";
import type { ServiceResult } from "../common/ServiceResult";

export interface DeXuatHocPhanActions {
    duyetDeXuat: (id: string) => Promise<ServiceResult<any>>; // ✅ Only id
    tuChoiDeXuat: (id: string) => Promise<ServiceResult<any>>; // ✅ Only id
}

export interface DuyetHocPhanProps {
    data: DeXuatHocPhanForTruongKhoaDTO[];
    loading: boolean;
    error: string | null;
    actions: DeXuatHocPhanActions;
}

export interface NganhDTO {
    id: string;
    tenNganh: string;
    khoaId: string;
}
