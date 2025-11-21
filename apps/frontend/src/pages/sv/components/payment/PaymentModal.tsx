import { useState } from "react";
import StudentInfo from "./StudentInfo";
import PaymentInfo from "./PaymentInfo";
import PaymentMethodSelector from "./PaymentMethodSelector";
import "./payment-modal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentInfo: {
    mssv: string;
    hoTen: string;
    lop: string;
    nganh: string;
  };
  paymentInfo: {
    tongHocPhi: number;
    soTinChi: number;
    donGia: number;
  };
  hocKyId: string;
  onSubmit: (method: string, hocKyId: string) => Promise<void>;
}

export default function PaymentModal({
  isOpen,
  onClose,
  studentInfo,
  paymentInfo,
  hocKyId,
  onSubmit,
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>("momo"); // ✅ Default MoMo
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedMethod, hocKyId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={handleOverlayClick}>
      <div className="payment-modal-container">
        {/* Header */}
        <div className="payment-modal-header">
          <h2>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7h18M3 12h18M3 17h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Thanh toán học phí
          </h2>
          <button className="payment-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="payment-modal-body">
          {/* Top Section - 2 Columns */}
          <div className="payment-top-section">
            <StudentInfo {...studentInfo} />
            <PaymentInfo {...paymentInfo} />
          </div>

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
        </div>

        {/* Footer */}
        <div className="payment-modal-footer">
          <button className="payment-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="payment-btn-submit"
            onClick={handleSubmit}
            disabled={!selectedMethod || submitting}
          >
            {submitting ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
