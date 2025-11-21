import { HocKy } from "../../../../domain/entities/HocKy.entity";

export interface IHocKyRepository {
    findAll(): Promise<HocKy[]>;
    findHienHanh(): Promise<HocKy | null>;
    findById(id: string): Promise<HocKy | null>;
    updateDates(id: string, ngayBatDau: Date, ngayKetThuc: Date): Promise<void>;
}

export const IHocKyRepository = Symbol.for("HocKyPublic.IHocKyRepository");
