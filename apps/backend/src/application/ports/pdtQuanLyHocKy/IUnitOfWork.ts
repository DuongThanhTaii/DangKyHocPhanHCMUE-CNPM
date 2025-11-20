import { IHocKyRepository } from "./repositories/IHocKyRepository";
import { IKyPhaseRepository } from "./repositories/IKyPhaseRepository";

export interface TransactionRepositories {
    hocKyRepo: IHocKyRepository;
    kyPhaseRepo: IKyPhaseRepository;
}

export interface IUnitOfWork {
    transaction<T>(work: (repos: TransactionRepositories) => Promise<T>): Promise<T>;

    getHocKyRepository(): IHocKyRepository;
    getKyPhaseRepository(): IKyPhaseRepository;
}

export const IUnitOfWork = Symbol.for("PdtQuanLyHocKy.IUnitOfWork");
