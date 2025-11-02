import { Container } from "inversify";

// Ports
import { IUnitOfWork } from "../../../application/ports/qlSinhVienPDT/IUnitOfWork";
import { IPasswordHasher } from "../../../application/ports/qlSinhVienPDT/services/IPasswordHasher";
import { IImportStrategy } from "../../../application/ports/qlSinhVienPDT/services/IImportStrategy";

// Implementations
import { PrismaUnitOfWork } from "../../persistence/qlSinhVienPDT/PrismaUnitOfWork";
import { BcryptPasswordHasher } from "../../services/qlSinhVienPDT/security/BcryptPasswordHasher";
import { ExcelImportStrategy } from "../../services/qlSinhVienPDT/import-strategies/ExcelImportStrategy";
import { SelfInputImportStrategy } from "../../services/qlSinhVienPDT/import-strategies/SelfInputImportStrategy";

// Use Cases
import { CreateSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/CreateSinhVien.usecase";
import { ListSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/ListSinhVien.usecase";
import { GetSinhVienDetailUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/GetSinhVienDetail.usecase";
import { UpdateSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/UpdateSinhVien.usecase";
import { DeleteSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/DeleteSinhVien.usecase";
import { ImportSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/import/ImportSinhVien.usecase";

// Controllers
import { SinhVienController } from "../../../presentation/http/controllers/qlSinhVienPDT/SinhVienController";
import { ImportSinhVienController } from "../../../presentation/http/controllers/qlSinhVienPDT/ImportSinhVienController";

export function registerQlSinhVienPDTBindings(container: Container) {
    // Bind Ports → Implementations
    container.bind(IUnitOfWork).to(PrismaUnitOfWork).inSingletonScope();
    container.bind(IPasswordHasher).to(BcryptPasswordHasher).inSingletonScope();

    // ✅ Fix: Bind strategies với identifier string thay vì named
    container.bind<IImportStrategy>("IImportStrategy.Excel").to(ExcelImportStrategy).inSingletonScope();
    container.bind<IImportStrategy>("IImportStrategy.SelfInput").to(SelfInputImportStrategy).inSingletonScope();

    // Bind Use Cases
    container.bind(CreateSinhVienUseCase).toSelf();
    container.bind(ListSinhVienUseCase).toSelf();
    container.bind(GetSinhVienDetailUseCase).toSelf();
    container.bind(UpdateSinhVienUseCase).toSelf();
    container.bind(DeleteSinhVienUseCase).toSelf();
    container.bind(ImportSinhVienUseCase).toSelf();

    // Bind Controllers
    container.bind(SinhVienController).toSelf();
    container.bind(ImportSinhVienController).toSelf();

    console.log("[DI] ✅ QL Sinh Vien PDT bindings registered");
}
