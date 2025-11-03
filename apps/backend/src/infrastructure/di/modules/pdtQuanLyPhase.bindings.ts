import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";
import { TYPES } from "../types";

// Repositories
import { PrismaKyPhaseRepository } from "../../persistence/pdtQuanLyPhase/PrismaKyPhaseRepository";
import { PrismaHocKyRepository } from "../../persistence/pdtQuanLyPhase/PrismaHocKyRepository";

// Use Cases
import { ToggleKyPhaseUseCase } from "../../../application/use-cases/pdtQuanLyPhase/ToggleKyPhase.usecase";
import { GetCurrentActivePhaseUseCase } from "../../../application/use-cases/pdtQuanLyPhase/GetCurrentActivePhase.usecase";

// Interfaces
import { IKyPhaseRepository } from "../../../application/ports/pdtQuanLyPhase/repositories/IKyPhaseRepository";
import { IHocKyRepository } from "../../../application/ports/pdtQuanLyPhase/repositories/IHocKyRepository";
import { KyPhaseController } from "../../../presentation/http/controllers/pdtQuanLyPhase/KyPhaseController";

export function registerPdtQuanLyPhaseBindings(container: Container) {
    const prisma = container.get<PrismaClient>(PrismaClient);

    // ✅ Bind Repositories
    container
        .bind<IKyPhaseRepository>(TYPES.PdtQuanLyPhase.IKyPhaseRepository)
        .toDynamicValue(() => new PrismaKyPhaseRepository(prisma))
        .inSingletonScope();

    container
        .bind<IHocKyRepository>(TYPES.PdtQuanLyPhase.IHocKyRepository)
        .toDynamicValue(() => new PrismaHocKyRepository(prisma))
        .inSingletonScope();

    // ✅ Bind Use Cases
    container.bind<ToggleKyPhaseUseCase>(TYPES.PdtQuanLyPhase.ToggleKyPhaseUseCase).to(ToggleKyPhaseUseCase);
    // ✅ ADD: Bind new use case
    container.bind<GetCurrentActivePhaseUseCase>(TYPES.PdtQuanLyPhase.GetCurrentActivePhaseUseCase).to(GetCurrentActivePhaseUseCase);

    // ✅ ADD: Bind Controller
    container.bind<KyPhaseController>(TYPES.PdtQuanLyPhase.KyPhaseController).to(KyPhaseController);

    console.log("[DI] ✅ PDT Quan Ly Phase bindings registered");
}
