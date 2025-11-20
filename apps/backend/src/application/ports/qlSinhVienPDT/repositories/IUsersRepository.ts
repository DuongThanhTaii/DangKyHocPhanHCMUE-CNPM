export interface CreateUserData {
    id: string;
    hoTen: string;
    taiKhoanId: string;
    maNhanVien: string;
    email: string;
}

export interface IUsersRepository {
    create(data: { id: string; hoTen: string; taiKhoanId: string; maNhanVien: string; email: string }): Promise<string>;
    update(id: string, data: { hoTen?: string }): Promise<void>;
}

export const IUsersRepository = Symbol.for("IUsersRepository");
