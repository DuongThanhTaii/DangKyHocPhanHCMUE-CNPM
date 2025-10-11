import type { truong_khoa, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class TruongKhoaRepository extends BaseRepository<truong_khoa> {
    constructor(prisma: PrismaClient) {
        super(prisma, "truong_khoa");
    }

}