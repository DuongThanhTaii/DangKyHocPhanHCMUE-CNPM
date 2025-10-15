import { khoa, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class KhoaRepository extends BaseRepository<khoa>{
    constructor(prisma: PrismaClient){
        super(prisma, "khoa");
    }
}