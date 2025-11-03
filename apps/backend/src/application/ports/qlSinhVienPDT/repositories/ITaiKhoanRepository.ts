export interface CreateTaiKhoanData {
    tenDangNhap: string;
    matKhau: string;
    loaiTaiKhoan: string;
    trangThaiHoatDong: boolean;
}

export interface TaiKhoanDTO {
    id: string;
    tenDangNhap: string;
}

export interface ITaiKhoanRepository {
    findByUsername(username: string): Promise<TaiKhoanDTO | null>;
}

export const ITaiKhoanRepository = Symbol.for("ITaiKhoanRepository");
