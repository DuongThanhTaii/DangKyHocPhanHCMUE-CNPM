import type { DeXuatHocPhanForTruongKhoaDTO } from "../tk/types";
export interface DeXuatHocPhanActions {
    duyetDeXuat?: (id: string) => Promise<boolean>;
    tuChoiDeXuat?: (id: string) => Promise<boolean>;
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
