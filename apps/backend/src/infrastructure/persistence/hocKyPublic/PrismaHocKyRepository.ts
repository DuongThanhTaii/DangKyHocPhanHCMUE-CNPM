import { PrismaClient, Prisma } from "@prisma/client";
import { IHocKyRepository } from "../../../application/ports/hocKyPublic/repositories/IHocKyRepository";
import { HocKy } from "../../../domain/entities/HocKy.entity";

export class PrismaHocKyRepository implements IHocKyRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findAll(): Promise<HocKy[]> {
        const records = await this.db.hoc_ky.findMany({
            orderBy: { ngay_bat_dau: "desc" },
        });

        return records.map((r) => this.toDomain(r));
    }

    async findHienHanh(): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findFirst({
            where: { trang_thai_hien_tai: true },
        });

        return record ? this.toDomain(record) : null;
    }

    async findById(id: string): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findUnique({
            where: { id },
        });

        return record ? this.toDomain(record) : null;
    }

    private toDomain(record: any): HocKy {
        return HocKy.fromPersistence({
            id: record.id,
            tenHocKy: record.ten_hoc_ky,
            maHocKy: record.ma_hoc_ky,
            nienKhoaId: record.id_nien_khoa,
            ngayBatDau: record.ngay_bat_dau,
            ngayKetThuc: record.ngay_ket_thuc,
            trangThaiHienTai: record.trang_thai_hien_tai || false,
        });
    }
}
