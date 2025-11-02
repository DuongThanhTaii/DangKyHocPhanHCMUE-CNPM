export interface NganhDTO {
    id: string;
    maNganh: string;
    tenNganh: string;
}

export interface INganhRepository {
    findById(id: string): Promise<NganhDTO | null>;
    findByMaNganh(maNganh: string): Promise<NganhDTO | null>;
}

export const INganhRepository = Symbol.for("INganhRepository");
