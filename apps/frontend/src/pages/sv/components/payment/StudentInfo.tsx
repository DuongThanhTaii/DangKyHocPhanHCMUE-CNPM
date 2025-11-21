interface Props {
  mssv: string;
  hoTen: string;
  lop: string;
  nganh: string;
}

export default function StudentInfo({ mssv, hoTen, lop, nganh }: Props) {
  return (
    <div className="payment-student-info">
      <h3>👤 Thông tin sinh viên</h3>
      <div className="payment-info-row">
        <span className="payment-info-label">MSSV:</span>
        <span className="payment-info-value">{mssv}</span>
      </div>
      <div className="payment-info-row">
        <span className="payment-info-label">Họ tên:</span>
        <span className="payment-info-value">{hoTen}</span>
      </div>
      <div className="payment-info-row">
        <span className="payment-info-label">Lớp:</span>
        <span className="payment-info-value">{lop}</span>
      </div>
      <div className="payment-info-row">
        <span className="payment-info-label">Ngành:</span>
        <span className="payment-info-value">{nganh}</span>
      </div>
    </div>
  );
}
