import { SinhVien } from "../../../../domain/entities/SinhVien.entity";

export interface PageParams {
    page: number;
    pageSize: number;
    search?: string;
}

export interface PageResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ISinhVienRepository {
    findById(id: string): Promise<SinhVien | null>;
    findByMssv(mssv: string): Promise<SinhVien | null>;
    findPaged(params: PageParams): Promise<PageResult<SinhVien>>;
    create(sinhVien: SinhVien): Promise<void>;
    update(sinhVien: SinhVien): Promise<void>;
    delete(id: string): Promise<void>;
}

export const ISinhVienRepository = Symbol.for("ISinhVienRepository");
