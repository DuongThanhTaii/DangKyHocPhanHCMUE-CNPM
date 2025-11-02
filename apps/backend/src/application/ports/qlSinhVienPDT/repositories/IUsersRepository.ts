export interface CreateUserData {
    id: string;
    hoTen: string;
    taiKhoanId: string;
    maNhanVien: string;
    email: string;
}

export interface IUsersRepository {
    findById(id: string): Promise<{ id: string; taiKhoanId: string } | null>;
    create(data: CreateUserData): Promise<string>;
    update(id: string, data: { hoTen?: string }): Promise<void>;
}

export const IUsersRepository = Symbol.for("IUsersRepository");
