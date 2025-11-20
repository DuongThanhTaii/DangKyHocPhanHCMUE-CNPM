import { HocKy } from "../../../../domain/entities/HocKy.entity";

export interface IHocKyRepository {
    findById(id: string): Promise<HocKy | null>;
    findHienHanh(): Promise<HocKy | null>;
    setHienHanh(hocKyId: string): Promise<void>;
    unsetAllHienHanh(): Promise<void>;
}

export const IHocKyRepository = Symbol.for("PdtQuanLyHocKy.IHocKyRepository");
