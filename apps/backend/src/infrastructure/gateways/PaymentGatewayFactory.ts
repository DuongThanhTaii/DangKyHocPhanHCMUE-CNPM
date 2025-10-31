import { injectable } from "inversify";
import { IPaymentGateway } from "../../application/ports/IPaymentGateway";
import { IPaymentGatewayFactory, PaymentProvider } from "../../application/ports/IPaymentGatewayFactory";
import { MoMoGateway } from "./MoMoGateway";

@injectable()
export class PaymentGatewayFactory implements IPaymentGatewayFactory {
    private gateways = new Map<PaymentProvider, IPaymentGateway>();

    constructor() {
        // Pre-initialize gateways
        this.gateways.set("momo", new MoMoGateway());
        // TODO: Add VNPay, Bank Transfer...
        // this.gateways.set("vnpay", new VNPayGateway());
    }

    create(provider: PaymentProvider): IPaymentGateway {
        const gateway = this.gateways.get(provider);
        if (!gateway) {
            throw new Error(`Payment gateway "${provider}" not supported`);
        }
        return gateway;
    }
}
