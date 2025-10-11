import { BaseRepository } from "./baseRepository";
import type { tro_ly_khoa, PrismaClient } from "@prisma/client";

export class TroLyKhoaRepository extends BaseRepository<tro_ly_khoa> {
    constructor(prisma: PrismaClient) {
        super(prisma, "tro_ly_khoa");
    }
}