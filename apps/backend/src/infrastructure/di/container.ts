import "reflect-metadata";
import { Container } from "inversify";
import { PrismaClient } from "@prisma/client";

// ==================== PAYMENT MODULE ====================

// Payment Ports
import { IPaymentRepository } from "../../application/ports/payment/IPaymentRepository";
import { IPaymentGateway } from "../../application/ports/payment/IPaymentGateway";
import { IPaymentGatewayFactory } from "../../application/ports/IPaymentGatewayFactory";
import { IPaymentValidationService } from "../../application/ports/payment/IPaymentValidationService";
import { IPaymentStatusService } from "../../application/ports/payment/IPaymentStatusService";

// Payment Implementations
import { PrismaPaymentRepository } from "../persistence/payment/PrismaPaymentRepository";
import { MoMoGateway } from "../gateways/MoMoGateway";
import { PaymentGatewayFactory } from "../gateways/PaymentGatewayFactory";
import { PaymentValidationService } from "../services/payment/PaymentValidationService";
import { PaymentStatusService } from "../services/payment/PaymentStatusService";

// Payment Use Cases
import { CreatePaymentUseCase } from "../../application/use-cases/payment/CreatePayment.usecase";
import { ProcessIPNUseCase } from "../../application/use-cases/payment/ProcessIPN.usecase";
import { GetPaymentStatusUseCase } from "../../application/use-cases/payment/GetPaymentStatus.usecase";
import { PaymentIPNController } from "../../interface/controllers/payment/PaymentIPNController";

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
container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient());

// ==================== PAYMENT BINDINGS ====================

container.bind<IPaymentRepository>(IPaymentRepository).to(PrismaPaymentRepository);
container.bind<IPaymentGateway>(IPaymentGateway).to(MoMoGateway);
container.bind<IPaymentGatewayFactory>(IPaymentGatewayFactory).to(PaymentGatewayFactory);
container.bind<IPaymentValidationService>(IPaymentValidationService).to(PaymentValidationService);
container.bind<IPaymentStatusService>(IPaymentStatusService).to(PaymentStatusService);

container.bind<CreatePaymentUseCase>(CreatePaymentUseCase).toSelf();
container.bind<ProcessIPNUseCase>(ProcessIPNUseCase).toSelf();
container.bind<GetPaymentStatusUseCase>(GetPaymentStatusUseCase).toSelf();

// Bind payment IPN use case & controller
container.bind(PaymentIPNController).toSelf();

// ==================== TUITION BINDINGS ====================

container.bind<ITuitionRepository>(ITuitionRepository).to(PrismaTuitionRepository);


// Tuition - Service
container.bind(IHocPhiService).to(HocPhiService);

container.bind<GetTuitionDetailsUseCase>(GetTuitionDetailsUseCase).toSelf();
container.bind<ComputeTuitionUseCase>(ComputeTuitionUseCase).toSelf();
container.bind<TuitionController>(TuitionController).toSelf();

// ==================== EXTERNAL BINDINGS ====================

container.bind<IEmailService>(IEmailService).to(ConsoleEmailService);
container.bind<SendTuitionCalculationNotificationUseCase>(SendTuitionCalculationNotificationUseCase).toSelf();

export { container };