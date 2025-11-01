interface Props {
  tongHocPhi: number;
  soTinChi: number;
  donGia: number;
}

export default function PaymentInfo({ tongHocPhi, soTinChi, donGia }: Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="payment-amount-section">
      <h3>💰 Thông tin thanh toán</h3>
      <div className="payment-total-amount">{formatCurrency(tongHocPhi)}</div>
      <div className="payment-amount-details">
        <div className="payment-detail-row">
          <span className="payment-detail-label">Số tín chỉ:</span>
          <span className="payment-detail-value">{soTinChi} TC</span>
        </div>
        <div className="payment-detail-row">
          <span className="payment-detail-label">Đơn giá:</span>
          <span className="payment-detail-value">
            {formatCurrency(donGia)}/TC
          </span>
        </div>
      </div>
    </div>
  );
}
