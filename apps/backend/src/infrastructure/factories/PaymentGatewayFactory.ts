import { injectable, inject } from "inversify";
import { IPaymentGateway } from "../../application/ports/payment/IPaymentGateway";
import { MoMoGateway } from "../gateways/MoMoGateway";
import { VNPayGateway } from "../gateways/VNPayGateway"; // ✅ Import VNPay
import { ZaloPayGateway } from "../gateways/ZaloPayGateway";
import { IPaymentGatewayFactory } from "../../application/ports/payment/IPaymentGatewayFactory";
import { PaymentProvider } from "../../application/ports/payment/IPaymentGatewayFactory";

@injectable()
export class PaymentGatewayFactory implements IPaymentGatewayFactory {
    constructor(
        @inject(MoMoGateway) private momoGateway: MoMoGateway,
        @inject(VNPayGateway) private vnpayGateway: VNPayGateway,
        @inject(ZaloPayGateway) private zalopayGateway: ZaloPayGateway
    ) { }

    create(provider: PaymentProvider): IPaymentGateway { // ✅ Dùng PaymentProvider
        switch (provider) {
            case "momo":
                return this.momoGateway;
            case "vnpay":
                return this.vnpayGateway;
            case "zalopay":
                return this.zalopayGateway;
            default:
                throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }
}
