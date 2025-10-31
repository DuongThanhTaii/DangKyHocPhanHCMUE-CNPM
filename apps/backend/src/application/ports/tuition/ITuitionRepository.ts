import { TuitionDetailDTO } from "../../dtos/tuition/TuitionDetailDTO";

export interface TuitionData {
    id: string;
    sinh_vien_id: string;
    hoc_ky_id: string;
    tong_hoc_phi: number;
    trang_thai_thanh_toan: string;
    chinh_sach_id: string | null;
}

export interface TuitionDetailData {
    lop_hoc_phan_id: string;
    so_tin_chi: number;
    phi_tin_chi: number;
    thanh_tien: number;
}

export interface TuitionDetailItemData {
    monHocId: string;
    tenMonHoc: string;
    soTinChi: number;
    donGia: number;
    thanhTien: number;
}

export interface ITuitionRepository {
    findBySinhVienAndHocKy(sinh_vien_id: string, hoc_ky_id: string): Promise<TuitionData | null>;
    getChiTietHocPhi(sinh_vien_id: string, hoc_ky_id: string): Promise<TuitionDetailDTO>;
    updatePaymentStatus(sinh_vien_id: string, hoc_ky_id: string): Promise<void>;
    updateTongHocPhi(sinh_vien_id: string, hoc_ky_id: string, tong_hoc_phi: number): Promise<void>;
    saveTuition(data: {
        sinh_vien_id: string;
        hoc_ky_id: string;
        tong_hoc_phi: number;
        chinh_sach_id: string;
        details: TuitionDetailData[];
    }): Promise<void>;
    updateTuition(data: {
        sinh_vien_id: string;
        hoc_ky_id: string;
        tong_hoc_phi: number;
        chinh_sach_id: string;
        details: TuitionDetailData[];
    }): Promise<void>;
}

export const ITuitionRepository = Symbol.for("ITuitionRepository");
