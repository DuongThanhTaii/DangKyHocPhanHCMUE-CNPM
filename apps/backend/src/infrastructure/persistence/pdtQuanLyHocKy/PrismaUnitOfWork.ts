import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IUnitOfWork, TransactionRepositories } from "../../../application/ports/pdtQuanLyHocKy/IUnitOfWork";
import { PrismaHocKyRepository } from "./PrismaHocKyRepository";
import { PrismaKyPhaseRepository } from "./PrismaKyPhaseRepository";

@injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
    constructor(
        @inject(PrismaClient) private prisma: PrismaClient
    ) { }

    async transaction<T>(work: (repos: TransactionRepositories) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (tx) => {
            const repos: TransactionRepositories = {
                hocKyRepo: new PrismaHocKyRepository(tx),
                kyPhaseRepo: new PrismaKyPhaseRepository(tx),
            };

            return work(repos);
        });
    }

    getHocKyRepository() {
        return new PrismaHocKyRepository(this.prisma);
    }

    getKyPhaseRepository() {
        return new PrismaKyPhaseRepository(this.prisma);
    }
}
