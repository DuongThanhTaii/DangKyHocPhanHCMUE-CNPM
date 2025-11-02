export interface CreateTaiKhoanData {
    tenDangNhap: string;
    matKhau: string;
    loaiTaiKhoan: string;
    trangThaiHoatDong: boolean;
}

export interface ITaiKhoanRepository {
    findByUsername(username: string): Promise<{ id: string } | null>;
    create(data: CreateTaiKhoanData): Promise<string>;
    update(id: string, data: { matKhau?: string; trangThaiHoatDong?: boolean }): Promise<void>;
    delete(id: string): Promise<void>;
}

export const ITaiKhoanRepository = Symbol.for("ITaiKhoanRepository");
