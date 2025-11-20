import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IKhoaRepository } from "../../../application/ports/dm/repositories/IKhoaRepository";
import { KhoaDto } from "../../../application/dtos/dm/KhoaDto";

@injectable()
export class PrismaKhoaRepository implements IKhoaRepository {
    constructor(private prisma: PrismaClient) { }

    async findAll(): Promise<KhoaDto[]> {
        const khoas = await this.prisma.khoa.findMany({
            orderBy: { ten_khoa: "asc" },
        });

        return khoas.map((k) => ({
            id: k.id,
            ma_khoa: k.ma_khoa,
            ten_khoa: k.ten_khoa,
            ngay_thanh_lap: k.ngay_thanh_lap,
            trang_thai_hoat_dong: k.trang_thai_hoat_dong ?? true,
            created_at: k.created_at,
            updated_at: k.updated_at,
        }));
    }
}
