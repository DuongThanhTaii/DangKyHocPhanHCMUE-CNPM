import { PrismaClient, de_xuat_hoc_phan_log } from "@prisma/client";
import { BaseRepository } from "./baseRepository";
export class DeXuatHPLogRepository extends BaseRepository<de_xuat_hoc_phan_log> {
    constructor(prisma: PrismaClient) {
        super(prisma, "de_xuat_hoc_phan_log");
    }
}