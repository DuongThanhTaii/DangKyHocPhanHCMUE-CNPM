import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";
import { TYPES } from "../types";

// Repositories
import { PrismaKhoaRepository } from "../../persistence/dm/PrismaKhoaRepository";
import { PrismaNganhRepository } from "../../persistence/dm/PrismaNganhRepository";
import { PrismaCoSoRepository } from "../../persistence/dm/PrismaCoSoRepository";

// Use Cases
import { DanhMucUseCases } from "../../../application/use-cases/dm/DanhMucUseCases";

// Interfaces
import { IKhoaRepository } from "../../../application/ports/dm/repositories/IKhoaRepository";
import { INganhRepository } from "../../../application/ports/dm/repositories/INganhRepository";
import { ICoSoRepository } from "../../../application/ports/dm/repositories/ICoSoRepository";

export function bindDanhMucModule(container: Container, prisma: PrismaClient) {
    // ✅ Bind Repositories
    container.bind<IKhoaRepository>(TYPES.IKhoaRepository).toDynamicValue(() => {
        return new PrismaKhoaRepository(prisma);
    }).inSingletonScope();

    container.bind<INganhRepository>(TYPES.INganhRepository).toDynamicValue(() => {
        return new PrismaNganhRepository(prisma);
    }).inSingletonScope();

    container.bind<ICoSoRepository>(TYPES.ICoSoRepository).toDynamicValue(() => {
        return new PrismaCoSoRepository(prisma);
    }).inSingletonScope();

    // ✅ Bind Use Cases
    container.bind<DanhMucUseCases>(TYPES.DanhMucUseCases).to(DanhMucUseCases).inSingletonScope();
}
