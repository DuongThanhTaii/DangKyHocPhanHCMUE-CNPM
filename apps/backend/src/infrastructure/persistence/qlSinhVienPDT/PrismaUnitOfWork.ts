import { PrismaClient, Prisma } from "@prisma/client";
import { IUnitOfWork, TransactionClient } from "../../../application/ports/qlSinhVienPDT/IUnitOfWork";
import { ISinhVienRepository } from "../../../application/ports/qlSinhVienPDT/repositories/ISinhVienRepository";
import { PrismaSinhVienRepository } from "./PrismaSinhVienRepository";
import { IKhoaRepository } from "../../../application/ports/qlSinhVienPDT/repositories/IKhoaRepository";
import { INganhRepository } from "../../../application/ports/qlSinhVienPDT/repositories/INganhRepository";
import { ITaiKhoanRepository } from "../../../application/ports/qlSinhVienPDT/repositories/ITaiKhoanRepository";
import { IUsersRepository } from "../../../application/ports/qlSinhVienPDT/repositories/IUsersRepository";
import { PrismaKhoaRepository } from "./PrismaKhoaRepository";
import { PrismaNganhRepository } from "./PrismaNganhRepository";
import { PrismaTaiKhoanRepository } from "./PrismaTaiKhoanRepository";
import { PrismaUsersRepository } from "./PrismaUsersRepository";

export class PrismaUnitOfWork implements IUnitOfWork {
    private sinhVienRepo: ISinhVienRepository;
    private khoaRepo: IKhoaRepository;
    private nganhRepo: INganhRepository;
    private taiKhoanRepo: ITaiKhoanRepository;
    private usersRepo: IUsersRepository;

    constructor(private prisma: PrismaClient) {
        this.sinhVienRepo = new PrismaSinhVienRepository(prisma);
        this.khoaRepo = new PrismaKhoaRepository(prisma);
        this.nganhRepo = new PrismaNganhRepository(prisma);
        this.taiKhoanRepo = new PrismaTaiKhoanRepository(prisma);
        this.usersRepo = new PrismaUsersRepository(prisma);
    }

    /**
     * ✅ Transaction sử dụng Prisma.$transaction (giống legacy)
     */
    async transaction<T>(work: (tx: TransactionClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(work);
    }

    getSinhVienRepository() {
        return this.sinhVienRepo;
    }
    getKhoaRepository() {
        return this.khoaRepo;
    }
    getNganhRepository() {
        return this.nganhRepo;
    }
    getTaiKhoanRepository() {
        return this.taiKhoanRepo;
    }
    getUsersRepository() {
        return this.usersRepo;
    }
}