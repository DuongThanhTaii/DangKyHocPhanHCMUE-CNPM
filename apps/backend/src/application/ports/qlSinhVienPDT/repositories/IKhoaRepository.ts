export interface KhoaDTO {
    id: string;
    maKhoa: string;
    tenKhoa: string;
}

export interface IKhoaRepository {
    findById(id: string): Promise<KhoaDTO | null>;
    findByMaKhoa(maKhoa: string): Promise<KhoaDTO | null>;
}

export const IKhoaRepository = Symbol.for("IKhoaRepository");
