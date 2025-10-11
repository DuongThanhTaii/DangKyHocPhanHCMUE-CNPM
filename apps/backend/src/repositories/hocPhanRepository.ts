import type { hoc_phan, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class HocPhanRepository extends BaseRepository<hoc_phan> {
    constructor(prisma: PrismaClient) {
        super(prisma, "hoc_phan");
    }
}