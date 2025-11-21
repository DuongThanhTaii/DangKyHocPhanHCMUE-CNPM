export interface KhoaDTO {
    id: string;
    maKhoa: string;
    tenKhoa: string;
}

export interface IKhoaRepository {
    findByMaKhoa(maKhoa: string): Promise<KhoaDTO | null>;
    findById(id: string): Promise<KhoaDTO | null>;
    findAll(): Promise<KhoaDTO[]>;
}

export const IKhoaRepository = Symbol.for("IKhoaRepository");
