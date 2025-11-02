import { HocKy } from "../../../../domain/entities/HocKy.entity";

export interface IHocKyRepository {
    findAll(): Promise<HocKy[]>;
    findHienHanh(): Promise<HocKy | null>;
    findById(id: string): Promise<HocKy | null>;
}

export const IHocKyRepository = Symbol.for("HocKyPublic.IHocKyRepository");
