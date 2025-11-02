import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma/client";
import { IUnitOfWork, TransactionRepositories } from "../../../application/ports/qlSinhVienPDT/IUnitOfWork";
import { PrismaSinhVienRepository } from "./PrismaSinhVienRepository";
import { PrismaTaiKhoanRepository } from "./PrismaTaiKhoanRepository";
import { PrismaUsersRepository } from "./PrismaUsersRepository";
import { PrismaKhoaRepository } from "./PrismaKhoaRepository";
import { PrismaNganhRepository } from "./PrismaNganhRepository";

@injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
    constructor(
        @inject(PrismaClient) private prisma: PrismaClient
    ) { }

    async transaction<T>(work: (repos: TransactionRepositories) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (tx) => {
            const repos: TransactionRepositories = {
                sinhVienRepo: new PrismaSinhVienRepository(tx),
                taiKhoanRepo: new PrismaTaiKhoanRepository(tx),
                usersRepo: new PrismaUsersRepository(tx),
                khoaRepo: new PrismaKhoaRepository(tx),
                nganhRepo: new PrismaNganhRepository(tx),
            };

            return work(repos);
        });
    }

    getSinhVienRepository() {
        return new PrismaSinhVienRepository(this.prisma);
    }

    getTaiKhoanRepository() {
        return new PrismaTaiKhoanRepository(this.prisma);
    }

    getKhoaRepository() {
        return new PrismaKhoaRepository(this.prisma);
    }

    getNganhRepository() {
        return new PrismaNganhRepository(this.prisma);
    }
}
