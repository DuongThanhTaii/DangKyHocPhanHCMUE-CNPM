import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { INganhRepository, NganhDTO } from "../../../application/ports/qlSinhVienPDT/repositories/INganhRepository";

@injectable()
export class PrismaNganhRepository implements INganhRepository {
    constructor(private prisma: PrismaClient) { }

    async findByMaNganh(maNganh: string): Promise<NganhDTO | null> {
        const nganh = await this.prisma.nganh_hoc.findUnique({
            where: { ma_nganh: maNganh },
            select: { id: true, ma_nganh: true, ten_nganh: true },
        });

        if (!nganh) return null;

        return {
            id: nganh.id,
            maNganh: nganh.ma_nganh,
            tenNganh: nganh.ten_nganh,
        };
    }

    async findById(id: string): Promise<NganhDTO | null> {
        const nganh = await this.prisma.nganh_hoc.findUnique({
            where: { id },
            select: { id: true, ma_nganh: true, ten_nganh: true },
        });

        if (!nganh) return null;

        return {
            id: nganh.id,
            maNganh: nganh.ma_nganh,
            tenNganh: nganh.ten_nganh,
        };
    }

    async findAll(): Promise<NganhDTO[]> {
        const nganhs = await this.prisma.nganh_hoc.findMany({
            select: { id: true, ma_nganh: true, ten_nganh: true },
            orderBy: { ten_nganh: "asc" },
        });

        return nganhs.map((n) => ({
            id: n.id,
            maNganh: n.ma_nganh,
            tenNganh: n.ten_nganh,
        }));
    }
}
