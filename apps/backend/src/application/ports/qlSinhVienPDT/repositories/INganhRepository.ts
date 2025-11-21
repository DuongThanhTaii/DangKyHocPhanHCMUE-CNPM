export interface NganhDTO {
    id: string;
    maNganh: string;
    tenNganh: string;
}

export interface INganhRepository {
    findByMaNganh(maNganh: string): Promise<NganhDTO | null>;
    findById(id: string): Promise<NganhDTO | null>;
    findAll(): Promise<NganhDTO[]>;
}

export const INganhRepository = Symbol.for("INganhRepository");
