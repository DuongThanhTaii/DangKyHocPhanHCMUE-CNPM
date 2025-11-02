import { Container } from "inversify";

// Ports
import { IUnitOfWork } from "../../../application/ports/hocKyPublic/IUnitOfWork";

// Implementations
import { PrismaUnitOfWork } from "../../persistence/hocKyPublic/PrismaUnitOfWork";

// Use Cases
import { GetHocKyNienKhoaUseCase } from "../../../application/use-cases/hocKyPublic/GetHocKyNienKhoa.usecase";
import { GetHocKyHienHanhUseCase } from "../../../application/use-cases/hocKyPublic/GetHocKyHienHanh.usecase";

// Controllers
import { HocKyPublicController } from "../../../presentation/http/controllers/hocKyPublic/HocKyPublicController";

export function registerHocKyPublicBindings(container: Container) {
    // Bind Ports → Implementations
    container.bind(IUnitOfWork).to(PrismaUnitOfWork).inSingletonScope();

    // Bind Use Cases
    container.bind(GetHocKyNienKhoaUseCase).toSelf();
    container.bind(GetHocKyHienHanhUseCase).toSelf();

    // Bind Controllers
    container.bind(HocKyPublicController).toSelf();

    console.log("[DI] ✅ HocKy Public bindings registered");
}
