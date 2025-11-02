import { NienKhoa } from "../../../../domain/entities/NienKhoa.entity";

export interface INienKhoaRepository {
    findAll(): Promise<NienKhoa[]>;
    findById(id: string): Promise<NienKhoa | null>;
}

export const INienKhoaRepository = Symbol.for("HocKyPublic.INienKhoaRepository");
