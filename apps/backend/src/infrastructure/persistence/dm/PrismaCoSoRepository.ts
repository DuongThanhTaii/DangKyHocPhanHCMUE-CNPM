import { injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { ICoSoRepository } from "../../../application/ports/dm/repositories/ICoSoRepository";
import { CoSoDto } from "../../../application/dtos/dm/CoSoDto";

@injectable()
export class PrismaCoSoRepository implements ICoSoRepository {
    constructor(private prisma: PrismaClient) { }

    async findAll(): Promise<CoSoDto[]> {
        const coSos = await this.prisma.co_so.findMany({
            orderBy: { ten_co_so: "asc" },
        });

        return coSos.map((c) => ({
            id: c.id,
            ten_co_so: c.ten_co_so,
            dia_chi: c.dia_chi,
        }));
    }
}
