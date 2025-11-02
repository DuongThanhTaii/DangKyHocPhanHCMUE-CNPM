import { PrismaClient, Prisma } from "@prisma/client";
import { INganhRepository, NganhDTO } from "../../../application/ports/qlSinhVienPDT/repositories/INganhRepository";

export class PrismaNganhRepository implements INganhRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findById(id: string): Promise<NganhDTO | null> {
        const record = await this.db.nganh_hoc.findUnique({ where: { id } });
        return record ? { id: record.id, maNganh: record.ma_nganh, tenNganh: record.ten_nganh } : null;
    }

    async findByMaNganh(maNganh: string): Promise<NganhDTO | null> {
        const record = await this.db.nganh_hoc.findFirst({ where: { ma_nganh: maNganh } });
        return record ? { id: record.id, maNganh: record.ma_nganh, tenNganh: record.ten_nganh } : null;
    }
}
