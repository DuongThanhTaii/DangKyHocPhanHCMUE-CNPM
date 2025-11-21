import { Container } from "inversify";

// Ports
import { ITaiLieuRepository } from "../../../application/ports/sinhvien/ITaiLieuRepository";

// Implementations
import { PrismaTaiLieuRepository } from "../../persistence/sinhvien/PrismaTaiLieuRepository";

// Use Cases
import { GetLopDaDangKyWithTaiLieuUseCase } from "../../../application/use-cases/sinhvien/GetLopDaDangKyWithTaiLieu.usecase";
import { GetTaiLieuByLopHocPhanUseCase } from "../../../application/use-cases/sinhvien/GetTaiLieuByLopHocPhan.usecase";

// Controllers
import { SinhVienTaiLieuController } from "../../../interface/controllers/sinhvien/SinhVienTaiLieuController";

export function registerSinhVienTaiLieuBindings(container: Container) {
    // Bind Ports → Implementations
    container.bind<ITaiLieuRepository>(ITaiLieuRepository).to(PrismaTaiLieuRepository);

    // Bind Use Cases
    container.bind<GetLopDaDangKyWithTaiLieuUseCase>(GetLopDaDangKyWithTaiLieuUseCase).toSelf();
    container.bind<GetTaiLieuByLopHocPhanUseCase>(GetTaiLieuByLopHocPhanUseCase).toSelf();

    // Bind Controllers
    container.bind<SinhVienTaiLieuController>(SinhVienTaiLieuController).toSelf();

    console.log("[DI] ✅ Sinh Vien Tai Lieu bindings registered");
}
