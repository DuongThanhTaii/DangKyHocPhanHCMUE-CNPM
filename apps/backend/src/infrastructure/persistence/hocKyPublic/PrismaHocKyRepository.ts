import { PrismaClient, Prisma } from "@prisma/client";
import { IHocKyRepository } from "../../../application/ports/hocKyPublic/repositories/IHocKyRepository";
import { HocKy } from "../../../domain/entities/HocKy.entity";

export class PrismaHocKyRepository implements IHocKyRepository {
    constructor(private db: PrismaClient | Prisma.TransactionClient) { }

    async findAll(): Promise<HocKy[]> {
        const records = await this.db.hoc_ky.findMany({
            orderBy: { ngay_bat_dau: "desc" },
        });

        // ✅ DEBUG: Log raw data from DB
        console.log("[PrismaHocKyRepository.findAll] Raw records:", JSON.stringify(records.slice(0, 2), null, 2));

        return records.map((r) => this.toDomain(r));
    }

    async findHienHanh(): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findFirst({
            where: { trang_thai_hien_tai: true },
        });

        // ✅ DEBUG: Log raw data
        console.log("[PrismaHocKyRepository.findHienHanh] Raw record:", JSON.stringify(record, null, 2));

        return record ? this.toDomain(record) : null;
    }

    async findById(id: string): Promise<HocKy | null> {
        const record = await this.db.hoc_ky.findUnique({
            where: { id },
        });

        return record ? this.toDomain(record) : null;
    }

    async updateDates(id: string, ngayBatDau: Date, ngayKetThuc: Date): Promise<void> {
        await this.db.hoc_ky.update({
            where: { id },
            data: {
                ngay_bat_dau: ngayBatDau,
                ngay_ket_thuc: ngayKetThuc,
            },
        });
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
