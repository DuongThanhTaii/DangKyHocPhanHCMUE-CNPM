import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IKhoaRepository, KhoaDTO } from "../../../application/ports/qlSinhVienPDT/repositories/IKhoaRepository";

@injectable()
export class PrismaKhoaRepository implements IKhoaRepository {
    constructor(private prisma: PrismaClient) { }

    async findByMaKhoa(maKhoa: string): Promise<KhoaDTO | null> {
        const khoa = await this.prisma.khoa.findUnique({
            where: { ma_khoa: maKhoa },
            select: { id: true, ma_khoa: true, ten_khoa: true },
        });

        if (!khoa) return null;

        return {
            id: khoa.id,
            maKhoa: khoa.ma_khoa,
            tenKhoa: khoa.ten_khoa,
        };
    }

    async findById(id: string): Promise<KhoaDTO | null> {
        const khoa = await this.prisma.khoa.findUnique({
            where: { id },
            select: { id: true, ma_khoa: true, ten_khoa: true },
        });

        if (!khoa) return null;

        return {
            id: khoa.id,
            maKhoa: khoa.ma_khoa,
            tenKhoa: khoa.ten_khoa,
        };
    }

    async findAll(): Promise<KhoaDTO[]> {
        const khoas = await this.prisma.khoa.findMany({
            select: { id: true, ma_khoa: true, ten_khoa: true },
            orderBy: { ten_khoa: "asc" },
        });

        return khoas.map((k) => ({
            id: k.id,
            maKhoa: k.ma_khoa,
            tenKhoa: k.ten_khoa,
        }));
    }
}
