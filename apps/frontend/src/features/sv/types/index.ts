// src/features/sv/types/index.ts

// ========== ĐĂNG KÝ HỌC PHẦN ==========

export interface CheckPhaseDangKyResponse {
    canRegister: boolean;
    message: string;
}

export interface DanhSachLopHocPhanDTO {
    monChung: MonHocGroupDTO[];
    batBuoc: MonHocGroupDTO[];
    tuChon: MonHocGroupDTO[];
}

export interface MonHocGroupDTO {
    monHocId: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[];
}

export interface LopHocPhanItemDTO {
    id: string;
    maLop: string;
    tenLop: string;
    soLuongHienTai: number;
    soLuongToiDa: number;
    tkb: TKBItemDTO[];
}

export interface TKBItemDTO {
    thu: number;
    tiet: string;
    phong: string;
    giangVien: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    formatted: string;
}

// ✅ Response đã đăng ký (flat list)
export interface LopDaDangKyItemDTO {
    lopHocPhanId: string; // ✅ ID để hủy đăng ký
    maLop: string;
    tenLop: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    giangVien: string;
    tkbFormatted: string;
}

// ✅ Request hủy đăng ký (single) - ONLY lop_hoc_phan_id
export interface HuyDangKyHocPhanRequest {
    lop_hoc_phan_id: string;
}

// ✅ Request chuyển lớp
export interface ChuyenLopHocPhanRequest {
    lop_hoc_phan_id_cu: string;
    lop_hoc_phan_id_moi: string;
}

// ========== LỊCH SỬ ĐĂNG KÝ ==========

export interface LichSuItemDTO {
    hanhDong: "dang_ky" | "huy";
    thoiGian: string; // ISO string
    monHoc: {
        maMon: string;
        tenMon: string;
        soTinChi: number;
    };
    lopHocPhan: {
        maLop: string;
        tenHocPhan: string;
    };
}

export interface LichSuDangKyDTO {
    hocKy: {
        tenHocKy: string;
        maHocKy: string;
    };
    ngayTao: string; // ISO string
    lichSu: LichSuItemDTO[];
}

// ========== THỜI KHÓA BIỂU ==========

export interface SVTKBWeeklyItemDTO {
    thu: number;
    tiet_bat_dau: number;
    tiet_ket_thuc: number;
    phong: {
        id: string;
        ma_phong: string;
    };
    mon_hoc: {
        ma_mon: string;
        ten_mon: string;
    };
    giang_vien: string;
    ngay_hoc: string; // ISO date string
}

// ========== TRA CỨU HỌC PHẦN ==========

export interface LopHocPhanTraCuuDTO {
    id: string;
    maLop: string;
    giangVien: string;
    soLuongToiDa: number;
    soLuongHienTai: number;
    conSlot: number;
    thoiKhoaBieu: string; // Multiline string
}

export interface MonHocTraCuuDTO {
    stt: number;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    loaiMon: "chuyen_nganh" | "dai_cuong" | "tu_chon";
    danhSachLop: LopHocPhanTraCuuDTO[];
}

export interface MonHocGhiDanhForSinhVien {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien: string;
}

export interface RequestGhiDanhMonHoc {
    monHocId: string;
}

export interface RequestHuyGhiDanhMonHoc {
    ghiDanhIds: string[];
}

export interface MonHocDaGhiDanh {
    ghiDanhId: string;      // ID của record ghi_danh_hoc_phan
    monHocId: string;       // ID môn học
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien?: string;
}

export interface DangKyHocPhanRequest {
    lop_hoc_phan_id: string;
    hoc_ky_id: string;
}


export interface MonHocInfoDTO {
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[]; // ✅ Danh sách lớp học phần của môn này
}

export type DanhSachLopDaDangKyDTO = MonHocInfoDTO[];

// ========== HỌC PHÍ ==========

export interface ChiTietMonHocDTO {
    maMon: string;
    tenMon: string;
    maLop: string;
    soTinChi: number;
    donGia: number;
    thanhTien: number;
}

export interface ChinhSachHocPhiDTO {
    tenChinhSach: string;
    ngayHieuLuc: string;
    ngayHetHieuLuc: string;
}

export interface ChiTietHocPhiDTO {
    tongHocPhi: number;
    soTinChiDangKy: number;
    donGiaTinChi: number;
    chinhSach: ChinhSachHocPhiDTO;
    chiTiet: ChiTietMonHocDTO[];
    trangThaiThanhToan: "chua_thanh_toan" | "da_thanh_toan" | "thanh_toan_mot_phan";
}

export interface ThanhToanHocPhiRequest {
    hocKyId: string;
    soTien: number;
    phuongThuc: "chuyen_khoan" | "tien_mat" | "momo" | "vnpay";
}

// ========== PAYMENT ==========

export interface CreatePaymentRequest {
    hocKyId: string; // ✅ ONLY hocKyId - BE tự lấy amount từ DB
    provider?: "momo" | "vnpay" | "zalopay"; // ✅ Add provider
}

export interface CreatePaymentResponse {
    payUrl: string;
    orderId: string;
    amount: number;
}

export interface PaymentStatusResponse {
    orderId: string;
    status: "pending" | "success" | "failed" | "cancelled";
    amount: number;
    createdAt: string;
    updatedAt: string;
}

export type PaymentErrorCode =
    | "ALREADY_PAID"
    | "AMOUNT_MISMATCH"
    | "PAYMENT_REJECTED"
    | "PAYMENT_TIMEOUT"
    | "INVALID_SIGNATURE"
    | "PAYMENT_PENDING";
