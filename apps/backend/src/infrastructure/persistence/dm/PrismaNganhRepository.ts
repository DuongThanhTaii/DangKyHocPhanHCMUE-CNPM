import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { INganhRepository } from "../../../application/ports/dm/repositories/INganhRepository";
import { NganhDto } from "../../../application/dtos/dm/NganhDto";

@injectable()
export class PrismaNganhRepository implements INganhRepository {
    constructor(private prisma: PrismaClient) { }

    async findAll(khoaId?: string): Promise<NganhDto[]> {
        const nganhs = await this.prisma.nganh_hoc.findMany({
            where: khoaId ? { khoa_id: khoaId } : undefined,
            orderBy: { ten_nganh: "asc" },
        });

        return nganhs.map((n) => ({
            id: n.id,
            ma_nganh: n.ma_nganh,
            ten_nganh: n.ten_nganh,
            khoa_id: n.khoa_id,
            created_at: n.created_at,
            updated_at: n.updated_at,
        }));
    }

    async findNganhChuaCoChinhSach(hocKyId: string, khoaId: string): Promise<NganhDto[]> {
        const nganhs = await this.prisma.nganh_hoc.findMany({
            where: {
                khoa_id: khoaId,
                chinh_sach_tin_chi: {
                    none: {
                        hoc_ky_id: hocKyId,
                    },
                },
            },
            orderBy: { ten_nganh: "asc" },
        });

        return nganhs.map((n) => ({
            id: n.id,
            ma_nganh: n.ma_nganh,
            ten_nganh: n.ten_nganh,
            khoa_id: n.khoa_id,
            created_at: n.created_at,
            updated_at: n.updated_at,
        }));
    }
}
