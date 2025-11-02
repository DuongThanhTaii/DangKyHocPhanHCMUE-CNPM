import { Container } from "inversify";

// Ports
import { IUnitOfWork } from "../../../application/ports/pdtQuanLyHocKy/IUnitOfWork";

// Implementations
import { PrismaUnitOfWork } from "../../persistence/pdtQuanLyHocKy/PrismaUnitOfWork";

// Use Cases
import { SetHocKyHienHanhUseCase } from "../../../application/use-cases/pdtQuanLyHocKy/SetHocKyHienHanh.usecase";
import { CreateBulkKyPhaseUseCase } from "../../../application/use-cases/pdtQuanLyHocKy/CreateBulkKyPhase.usecase";
import { GetPhasesByHocKyUseCase } from "../../../application/use-cases/pdtQuanLyHocKy/GetPhasesByHocKy.usecase";

// Controllers
import { QuanLyHocKyController } from "../../../presentation/http/controllers/pdtQuanLyHocKy/QuanLyHocKyController";
export function registerPdtQuanLyHocKyBindings(container: Container) {
    // Bind Ports → Implementations
    container.bind(IUnitOfWork).to(PrismaUnitOfWork).inSingletonScope();

    // Bind Use Cases
    container.bind(SetHocKyHienHanhUseCase).toSelf();
    container.bind(CreateBulkKyPhaseUseCase).toSelf();
    container.bind(GetPhasesByHocKyUseCase).toSelf();

    // Bind Controllers
    container.bind(QuanLyHocKyController).toSelf();

    console.log("[DI] ✅ PDT Quan Ly Hoc Ky bindings registered");
}
