import { IHocKyRepository } from "./repositories/IHocKyRepository";
import { INienKhoaRepository } from "./repositories/INienKhoaRepository";

export interface IUnitOfWork {
    getHocKyRepository(): IHocKyRepository;
    getNienKhoaRepository(): INienKhoaRepository;
}

export const IUnitOfWork = Symbol.for("HocKyPublic.IUnitOfWork");
