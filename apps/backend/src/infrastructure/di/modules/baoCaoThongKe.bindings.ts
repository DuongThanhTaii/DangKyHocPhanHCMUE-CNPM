import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";

// Ports
import { IBaoCaoRepository } from "../../../application/ports/baoCaoThongKe/IBaoCaoRepository";

// Implementations
import { PrismaBaoCaoRepository } from "../../persistence/baoCaoThongKe/PrismaBaoCaoRepository";
import { ExcelExportStrategy } from "../../services/baoCaoThongKe/export-strategies/ExcelExportStrategy";
import { PDFExportStrategy } from "../../services/baoCaoThongKe/export-strategies/PDFExportStrategy";

// Use Cases
import { GetOverviewUseCase } from "../../../application/use-cases/baoCaoThongKe/GetOverview.usecase";
import { GetDangKyTheoKhoaUseCase } from "../../../application/use-cases/baoCaoThongKe/GetDangKyTheoKhoa.usecase";
import { GetDangKyTheoNganhUseCase } from "../../../application/use-cases/baoCaoThongKe/GetDangKyTheoNganh.usecase";
import { GetTaiGiangVienUseCase } from "../../../application/use-cases/baoCaoThongKe/GetTaiGiangVien.usecase";
import { ExportBaoCaoUseCase } from "../../../application/use-cases/baoCaoThongKe/ExportBaoCao.usecase";

// Controllers
import { BaoCaoController } from "../../../presentation/http/controllers/baoCaoThongKe/BaoCaoController";

export function registerBaoCaoThongKeBindings(container: Container) {
    // ✅ FIX: Bind Repository correctly
    container.bind(IBaoCaoRepository).toDynamicValue(() => {
        const prisma = container.get(PrismaClient);
        return new PrismaBaoCaoRepository(prisma);
    }).inSingletonScope();

    // Bind Export Strategies
    container.bind<ExcelExportStrategy>("ExcelExportStrategy").to(ExcelExportStrategy).inSingletonScope();
    container.bind<PDFExportStrategy>("PDFExportStrategy").to(PDFExportStrategy).inSingletonScope();

    // Bind Use Cases
    container.bind(GetOverviewUseCase).toSelf();
    container.bind(GetDangKyTheoKhoaUseCase).toSelf();
    container.bind(GetDangKyTheoNganhUseCase).toSelf();
    container.bind(GetTaiGiangVienUseCase).toSelf();
    container.bind(ExportBaoCaoUseCase).toSelf();

    // Bind Controllers
    container.bind(BaoCaoController).toSelf();

    console.log("[DI] ✅ Bao Cao Thong Ke bindings registered");
}
