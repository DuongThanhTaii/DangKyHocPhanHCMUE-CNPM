import { PrismaClient, Prisma } from "@prisma/client";
import { IKhoaRepository, KhoaDTO } from "../../../application/ports/qlSinhVienPDT/repositories/IKhoaRepository";

export class PrismaKhoaRepository implements IKhoaRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findById(id: string): Promise<KhoaDTO | null> {
        const record = await this.db.khoa.findUnique({ where: { id } });
        return record ? { id: record.id, maKhoa: record.ma_khoa, tenKhoa: record.ten_khoa } : null;
    }

    async findByMaKhoa(maKhoa: string): Promise<KhoaDTO | null> {
        const record = await this.db.khoa.findFirst({ where: { ma_khoa: maKhoa } });
        return record ? { id: record.id, maKhoa: record.ma_khoa, tenKhoa: record.ten_khoa } : null;
    }
}
