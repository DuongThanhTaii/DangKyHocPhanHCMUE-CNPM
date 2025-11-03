import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IHocKyRepository } from "../../../application/ports/pdtQuanLyPhase/repositories/IHocKyRepository";

@injectable()
export class PrismaHocKyRepository implements IHocKyRepository {
    constructor(private prisma: PrismaClient) { }

    async findHocKyHienHanh() {
        const hocKy = await this.prisma.hoc_ky.findFirst({
            where: { trang_thai_hien_tai: true },
            select: { id: true, ten_hoc_ky: true },
        });

        return hocKy;
    }
}
