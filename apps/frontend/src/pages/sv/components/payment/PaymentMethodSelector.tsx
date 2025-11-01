import React from "react";

interface PaymentMethod {
  id: "momo" | "vnpay" | "zalopay";
  name: string;
  logo: string; // ✅ Change to image path
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "momo",
    name: "MoMo",
    logo: "/assets/icon/momo.svg", // ✅ Use SVG from public
  },
  {
    id: "vnpay",
    name: "VNPay",
    logo: "/assets/icon/vnpay.svg", // ✅ Use SVG from public
  },
  {
    id: "zalopay",
    name: "ZaloPay",
    logo: "/assets/icon/zalopay.svg", // ✅ Use SVG from public
  },
];

interface Props {
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: Props) {
  return (
    <div className="payment-method-section">
      <h3>Chọn phương thức thanh toán:</h3>
      <div className="payment-method-grid">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            className={`payment-method-box ${
              selectedMethod === method.id ? "selected" : ""
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            {selectedMethod === method.id && (
              <div className="payment-method-checkmark">✓</div>
            )}
            <img
              src={method.logo}
              alt={method.name}
              className="payment-method-logo"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
