import { PrismaClient, Prisma } from "@prisma/client";
import { INienKhoaRepository } from "../../../application/ports/hocKyPublic/repositories/INienKhoaRepository";
import { NienKhoa } from "../../../domain/entities/NienKhoa.entity";

export class PrismaNienKhoaRepository implements INienKhoaRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findAll(): Promise<NienKhoa[]> {
        const records = await this.db.nien_khoa.findMany({
            orderBy: { ngay_bat_dau: "desc" },
        });

        return records.map((r) => this.toDomain(r));
    }

    async findById(id: string): Promise<NienKhoa | null> {
        const record = await this.db.nien_khoa.findUnique({
            where: { id },
        });

        return record ? this.toDomain(record) : null;
    }

    private toDomain(record: any): NienKhoa {
        return NienKhoa.fromPersistence({
            id: record.id,
            tenNienKhoa: record.ten_nien_khoa,
            ngayBatDau: record.ngay_bat_dau,
            ngayKetThuc: record.ngay_ket_thuc,
        });
    }
}
