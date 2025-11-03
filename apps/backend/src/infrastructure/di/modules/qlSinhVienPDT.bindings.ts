import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";
import { TYPES } from "../types";

// Ports
import { IUnitOfWork } from "../../../application/ports/qlSinhVienPDT/IUnitOfWork";
import { ISinhVienRepository } from "../../../application/ports/qlSinhVienPDT/repositories/ISinhVienRepository";
import { IPasswordHasher } from "../../../application/ports/qlSinhVienPDT/services/IPasswordHasher";

// Implementations
import { PrismaUnitOfWork } from "../../persistence/qlSinhVienPDT/PrismaUnitOfWork";
import { PrismaSinhVienRepository } from "../../persistence/qlSinhVienPDT/PrismaSinhVienRepository";
import { BcryptPasswordHasher } from "../../services/qlSinhVienPDT/BcryptPasswordHasher";

// Use Cases
import { CreateSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/CreateSinhVien.usecase";
import { UpdateSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/UpdateSinhVien.usecase";
import { ListSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/ListSinhVien.usecase";
import { GetSinhVienDetailUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/GetSinhVienDetail.usecase";
import { DeleteSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/crud/DeleteSinhVien.usecase";
import { ImportSinhVienUseCase } from "../../../application/use-cases/qlSinhVienPDT/import/ImportSinhVien.usecase";
import { SinhVienController } from "../../../presentation/http/controllers/qlSinhVienPDT/SinhVienController";
import { ImportSinhVienController } from "../../../presentation/http/controllers/qlSinhVienPDT/ImportSinhVienController";

export function registerQlSinhVienPDTBindings(container: Container) {
  const prisma = container.get<PrismaClient>(PrismaClient);

  // ✅ Bind Infrastructure (use TYPES.QlSinhVienPDT.*)
  container.bind<IUnitOfWork>(TYPES.QlSinhVienPDT.IUnitOfWork)
    .toDynamicValue(() => new PrismaUnitOfWork(prisma))
    .inSingletonScope();

  container.bind<ISinhVienRepository>(TYPES.QlSinhVienPDT.ISinhVienRepository)
    .toDynamicValue(() => new PrismaSinhVienRepository(prisma))
    .inSingletonScope();

  container.bind<IPasswordHasher>(TYPES.QlSinhVienPDT.IPasswordHasher)
    .to(BcryptPasswordHasher)
    .inSingletonScope();

  // ✅ Bind Use Cases
  container.bind<CreateSinhVienUseCase>(TYPES.QlSinhVienPDT.CreateSinhVienUseCase).to(CreateSinhVienUseCase);
  container.bind<UpdateSinhVienUseCase>(TYPES.QlSinhVienPDT.UpdateSinhVienUseCase).to(UpdateSinhVienUseCase);
  container.bind<ListSinhVienUseCase>(TYPES.QlSinhVienPDT.ListSinhVienUseCase).to(ListSinhVienUseCase);
  container.bind<GetSinhVienDetailUseCase>(TYPES.QlSinhVienPDT.GetSinhVienDetailUseCase).to(GetSinhVienDetailUseCase);
  container.bind<DeleteSinhVienUseCase>(TYPES.QlSinhVienPDT.DeleteSinhVienUseCase).to(DeleteSinhVienUseCase);
  container.bind<ImportSinhVienUseCase>(TYPES.QlSinhVienPDT.ImportSinhVienUseCase).to(ImportSinhVienUseCase);

  // ✅ Bind Controllers
  container.bind<SinhVienController>(TYPES.QlSinhVienPDT.SinhVienController).to(SinhVienController);
  container.bind<ImportSinhVienController>(TYPES.QlSinhVienPDT.ImportSinhVienController).to(ImportSinhVienController);

  console.log("[DI] ✅ QL Sinh Vien PDT bindings registered");
}
