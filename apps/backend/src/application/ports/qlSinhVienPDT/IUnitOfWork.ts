import { ISinhVienRepository } from "./repositories/ISinhVienRepository";
import { ITaiKhoanRepository } from "./repositories/ITaiKhoanRepository";
import { IUsersRepository } from "./repositories/IUsersRepository";
import { IKhoaRepository } from "./repositories/IKhoaRepository";
import { INganhRepository } from "./repositories/INganhRepository";

export interface TransactionRepositories {
    sinhVienRepo: ISinhVienRepository;
    taiKhoanRepo: ITaiKhoanRepository;
    usersRepo: IUsersRepository;
    khoaRepo: IKhoaRepository;
    nganhRepo: INganhRepository;
}

export interface IUnitOfWork {
    transaction<T>(work: (repos: TransactionRepositories) => Promise<T>): Promise<T>;

    getSinhVienRepository(): ISinhVienRepository;
    getTaiKhoanRepository(): ITaiKhoanRepository;
    getKhoaRepository(): IKhoaRepository;
    getNganhRepository(): INganhRepository;
}

export const IUnitOfWork = Symbol.for("QlSinhVienPDT.IUnitOfWork");
