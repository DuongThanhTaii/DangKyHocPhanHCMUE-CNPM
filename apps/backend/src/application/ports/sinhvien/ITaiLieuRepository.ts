export interface TaiLieuData {
    id: string;
    lop_hoc_phan_id: string;
    ten_tai_lieu: string;
    file_path: string;
    file_type: string | null;
    uploaded_by: string | null;
    created_at: Date;
    uploader_name?: string;
}

export interface LopDaDangKyWithTaiLieuData {
    lopHocPhanId: string;
    maLop: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    giangVien: string;
    trangThaiDangKy: string;
    ngayDangKy: Date;
    taiLieu: TaiLieuData[];
}

export interface ITaiLieuRepository {
    /**
     * Lấy tài liệu theo lớp học phần ID
     */
    findByLopHocPhanId(lop_hoc_phan_id: string): Promise<TaiLieuData[]>;

    /**
     * Lấy tài liệu của nhiều lớp học phần cùng lúc
     */
    findByMultipleLopHocPhanIds(lop_hoc_phan_ids: string[]): Promise<TaiLieuData[]>;

    /**
     * Lấy danh sách lớp đã đăng ký kèm tài liệu
     */
    getLopDaDangKyWithTaiLieu(sinh_vien_id: string, hoc_ky_id: string): Promise<LopDaDangKyWithTaiLieuData[]>;

    /**
     * Kiểm tra sinh viên có đăng ký lớp học phần không
     */
    checkSinhVienDangKyLop(sinh_vien_id: string, lop_hoc_phan_id: string): Promise<boolean>;
}

export const ITaiLieuRepository = Symbol.for("ITaiLieuRepository");
