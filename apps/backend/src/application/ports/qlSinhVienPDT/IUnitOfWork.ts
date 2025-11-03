import { Prisma } from "@prisma/client";
import { ISinhVienRepository } from "./repositories/ISinhVienRepository";
import { IKhoaRepository } from "./repositories/IKhoaRepository";
import { INganhRepository } from "./repositories/INganhRepository";
import { ITaiKhoanRepository } from "./repositories/ITaiKhoanRepository";
import { IUsersRepository } from "./repositories/IUsersRepository";

/**
 * ✅ Prisma TransactionClient (có đầy đủ Prisma methods)
 */
export type TransactionClient = Prisma.TransactionClient;

export interface IUnitOfWork {
    /**
     * Execute work in transaction
     * ✅ Truyền Prisma TransactionClient (giống legacy code)
     */
    transaction<T>(work: (tx: TransactionClient) => Promise<T>): Promise<T>;

    /**
     * Direct repository access (outside transaction)
     */
    getSinhVienRepository(): ISinhVienRepository;
    getKhoaRepository(): IKhoaRepository;
    getNganhRepository(): INganhRepository;
    getTaiKhoanRepository(): ITaiKhoanRepository;
    getUsersRepository(): IUsersRepository;
}

export const IUnitOfWork = Symbol.for("QlSinhVienPDT.IUnitOfWork");