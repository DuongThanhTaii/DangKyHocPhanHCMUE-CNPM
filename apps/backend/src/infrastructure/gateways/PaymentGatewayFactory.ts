import { injectable } from "inversify";
import { IPaymentGateway } from "../../application/ports/IPaymentGateway";
import { IPaymentGatewayFactory, PaymentProvider } from "../../application/ports/payment/IPaymentGatewayFactory";
import { MoMoGateway } from "./MoMoGateway";
import { VNPayGateway } from "./VNPayGateway";
import { ZaloPayGateway } from "./ZaloPayGateway";

@injectable()
export class PaymentGatewayFactory implements IPaymentGatewayFactory {
    private gateways = new Map<PaymentProvider, IPaymentGateway>();

    constructor() {
        // Pre-initialize gateways
        this.gateways.set("momo", new MoMoGateway());
        this.gateways.set("vnpay", new VNPayGateway());
        this.gateways.set("zalopay", new ZaloPayGateway()); // ✅ Thêm zalopay
    }

    create(provider: PaymentProvider): IPaymentGateway {
        const gateway = this.gateways.get(provider);
        if (!gateway) {
            throw new Error(`Payment gateway "${provider}" not supported`);
        }
        return gateway;
    }
}
