import "reflect-metadata";
import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";

// ==================== PAYMENT MODULE ====================

// Payment Ports
import { IPaymentRepository } from "../../application/ports/payment/IPaymentRepository";
import { IPaymentGateway } from "../../application/ports/payment/IPaymentGateway";
import { IPaymentGatewayFactory } from "../../application/ports/payment/IPaymentGatewayFactory";
import { PaymentGatewayFactory } from "../factories/PaymentGatewayFactory";
import { IPaymentValidationService } from "../../application/ports/payment/IPaymentValidationService";
import { IPaymentStatusService } from "../../application/ports/payment/IPaymentStatusService";

// Payment Implementations
import { PrismaPaymentRepository } from "../persistence/payment/PrismaPaymentRepository";
import { MoMoGateway } from "../gateways/MoMoGateway";
import { VNPayGateway } from "../gateways/VNPayGateway";
import { ZaloPayGateway } from "../gateways/ZaloPayGateway";
import { PaymentValidationService } from "../services/payment/PaymentValidationService";
import { PaymentStatusService } from "../services/payment/PaymentStatusService";

// Payment Use Cases
import { CreatePaymentUseCase } from "../../application/use-cases/payment/CreatePayment.usecase";
import { ProcessIPNUseCase } from "../../application/use-cases/payment/ProcessIPN.usecase";
import { GetPaymentStatusUseCase } from "../../application/use-cases/payment/GetPaymentStatus.usecase";
import { UnifiedIPNHandlerUseCase } from "../../application/use-cases/payment/UnifiedIPNHandler.usecase";

// ==================== TUITION MODULE ====================

// Tuition Ports
import { ITuitionRepository } from "../../application/ports/tuition/ITuitionRepository";
import { IPolicyService } from "../../application/ports/tuition/IPolicyService";
import { IStudentCourseService } from "../../application/ports/tuition/IStudentCourseService";
import { IStudentService } from "../../application/ports/tuition/IStudentService";
import { IHocPhiService } from "../../application/ports/tuition/IHocPhiService";

// Tuition Implementations
import { PrismaTuitionRepository } from "../persistence/tuition/PrismaTuitionRepository";
import { PolicyService } from "../services/tuition/PolicyService";
import { StudentCourseService } from "../services/tuition/StudentCourseService";
import { StudentService } from "../services/tuition/StudentService";

// Tuition Use Cases
import { GetTuitionDetailsUseCase } from "../../application/use-cases/tuition/GetTuitionDetails.usecase";
import { ComputeTuitionUseCase } from "../../application/use-cases/tuition/ComputeTuition.usecase";
import { CalculateTuitionForSemesterUseCase } from "../../application/use-cases/tuition/CalculateTuitionForSemester.usecase";
import { TuitionController } from "../../interface/controllers/tuition/TuitionController";
import { HocPhiService } from "../services/tuition/HocPhiService";
// ==================== EXTERNAL SERVICES ====================

// External Ports
import { IEmailService } from "../../application/ports/external/IEmailService";

// External Implementations
import { ConsoleEmailService } from "../external/ConsoleEmailService";

// External Use Cases
import { SendTuitionCalculationNotificationUseCase } from "../../application/use-cases/external/SendTuitionCalculationNotification.usecase";

// ==================== CONTAINER SETUP ====================

const container = new Container();

// Bind Prisma Client (Singleton)
const prisma = new PrismaClient();
container.bind<PrismaClient>(PrismaClient).toConstantValue(prisma);

// ==================== PAYMENT BINDINGS ====================

container.bind<IPaymentRepository>(IPaymentRepository).to(PrismaPaymentRepository);
container.bind<IPaymentGateway>(IPaymentGateway).to(MoMoGateway);
container.bind(MoMoGateway).toSelf();
container.bind(VNPayGateway).toSelf(); // ✅ Bind VNPay
container.bind<IPaymentGatewayFactory>(IPaymentGatewayFactory).to(PaymentGatewayFactory);
container.bind<IPaymentValidationService>(IPaymentValidationService).to(PaymentValidationService);
container.bind<IPaymentStatusService>(IPaymentStatusService).to(PaymentStatusService);

container.bind<CreatePaymentUseCase>(CreatePaymentUseCase).toSelf();
container.bind<ProcessIPNUseCase>(ProcessIPNUseCase).toSelf();
container.bind<UnifiedIPNHandlerUseCase>(UnifiedIPNHandlerUseCase).toSelf(); // ✅ Thêm dòng này
container.bind<GetPaymentStatusUseCase>(GetPaymentStatusUseCase).toSelf();
container.bind<ZaloPayGateway>(ZaloPayGateway).toSelf();

// ==================== TUITION BINDINGS ====================

container.bind<ITuitionRepository>(ITuitionRepository).to(PrismaTuitionRepository);
container.bind<IPolicyService>(IPolicyService).to(PolicyService);
container.bind<IStudentCourseService>(IStudentCourseService).to(StudentCourseService);
container.bind<IStudentService>(IStudentService).to(StudentService);
container.bind(IHocPhiService).to(HocPhiService);

container.bind<GetTuitionDetailsUseCase>(GetTuitionDetailsUseCase).toSelf();
container.bind<ComputeTuitionUseCase>(ComputeTuitionUseCase).toSelf();
container.bind<CalculateTuitionForSemesterUseCase>(CalculateTuitionForSemesterUseCase).toSelf();
container.bind<TuitionController>(TuitionController).toSelf();

// ==================== EXTERNAL BINDINGS ====================

container.bind<IEmailService>(IEmailService).to(ConsoleEmailService);
container.bind<SendTuitionCalculationNotificationUseCase>(SendTuitionCalculationNotificationUseCase).toSelf();

// ✅ Import new module bindings
import { registerQlSinhVienPDTBindings } from "./modules/qlSinhVienPDT.bindings";
import { registerHocKyPublicBindings } from "./modules/hocKyPublic.bindings";
// ✅ Import PDT Quan Ly Hoc Ky module bindings
import { registerPdtQuanLyHocKyBindings } from "./modules/pdtQuanLyHocKy.bindings";
// ✅ Import BaoCaoThongKe module bindings
import { registerBaoCaoThongKeBindings } from "./modules/baoCaoThongKe.bindings";
import { bindDanhMucModule } from "./modules/dm.bindings";
import { registerPdtQuanLyPhaseBindings } from "./modules/pdtQuanLyPhase.bindings";
// ✅ Import Sinh Vien Tai Lieu module bindings
import { registerSinhVienTaiLieuBindings } from "./modules/sinhvienTaiLieu.bindings";

// ✅ Register QL Sinh Vien PDT module
registerQlSinhVienPDTBindings(container);
// ✅ Register HocKy Public module
registerHocKyPublicBindings(container);
// ✅ Register PDT Quan Ly Hoc Ky module
registerPdtQuanLyHocKyBindings(container);
// ✅ Register BaoCao Thong Ke module
registerBaoCaoThongKeBindings(container);
// ✅ Register PDT Quan Ly Phase module
registerPdtQuanLyPhaseBindings(container);
// ✅ Register Sinh Vien Tai Lieu module
registerSinhVienTaiLieuBindings(container);

// ✅ Bind DM module
bindDanhMucModule(container, prisma);

export { container };