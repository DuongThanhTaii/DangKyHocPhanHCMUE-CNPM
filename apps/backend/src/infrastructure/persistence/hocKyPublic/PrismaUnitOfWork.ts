import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IUnitOfWork } from "../../../application/ports/hocKyPublic/IUnitOfWork";
import { PrismaHocKyRepository } from "./PrismaHocKyRepository";
import { PrismaNienKhoaRepository } from "./PrismaNienKhoaRepository";

@injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
    constructor(
        @inject(PrismaClient) private prisma: PrismaClient
    ) { }

    getHocKyRepository() {
        return new PrismaHocKyRepository(this.prisma);
    }

    getNienKhoaRepository() {
        return new PrismaNienKhoaRepository(this.prisma);
    }
}
