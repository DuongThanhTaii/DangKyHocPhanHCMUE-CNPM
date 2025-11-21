import { useEffect, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useHocPhi, useCreatePayment } from "../../features/sv/hooks";
import { useModalContext } from "../../hook/ModalContext";
import PaymentModal from "./components/payment/PaymentModal";
import { getStudentInfoFromJWT } from "../../utils/jwtUtils";
import HocKySelector from "../../components/HocKySelector";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

export default function ThanhToanHocPhi() {
  const { openNotify, openConfirm } = useModalContext();
  const { createPayment, loading: creatingPayment } = useCreatePayment();

  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const studentInfo = getStudentInfoFromJWT();

  const { data, loading: loadingData } = useHocPhi(selectedHocKyId);

  // ✅ Handle payment submission with provider
  const handlePaymentSubmit = async (method: string, hocKyId: string) => {
    console.log("💳 Payment method:", method);

    // ✅ Map FE method ID to BE provider
    const providerMap: Record<string, "momo" | "vnpay" | "zalopay"> = {
      momo: "momo",
      vnpay: "vnpay",
      zalopay: "zalopay",
    };

    const provider = providerMap[method];

    if (!provider) {
      openNotify({
        message: "Phương thức thanh toán không hợp lệ",
        type: "error",
      });
      return;
    }

    // ✅ REMOVE restriction - allow all payment methods
    // All providers are now enabled - Backend will handle routing
    console.log(
      `🚀 Processing payment with provider: ${provider.toUpperCase()}`
    );

    // ✅ Call API with provider
    const result = await createPayment({
      hocKyId,
      provider, // ✅ Send provider to BE
    });

    if (result.success && result.data) {
      setShowPaymentModal(false);

      // ✅ Log redirect URL for debugging
      console.log(
        `🔗 Redirecting to ${provider.toUpperCase()}:`,
        result.data.payUrl
      );

      window.location.href = result.data.payUrl;
    }
  };

  // Fallback if no student info
  const defaultStudentInfo = {
    mssv: "N/A",
    hoTen: "N/A",
    lop: "N/A",
    nganh: "N/A",
  };

  // ========= Render Loading =========
  if (loadingData) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">THANH TOÁN HỌC PHÍ</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          Đang tải dữ liệu...
        </div>
      </section>
    );
  }

  // ========= Render =========
  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">THANH TOÁN HỌC PHÍ</p>
      </div>

      <div className="body__inner">
        {/* ✅ Filters - Disable auto-select để tránh infinite loop */}
        <div className="selecy__duyethp__container">
          <HocKySelector
            onHocKyChange={setSelectedHocKyId}
            autoSelectCurrent={true} // ✅ Keep auto-select for user convenience
          />
        </div>

        {/* ✅ Loading state */}
        {loadingData && (
          <p style={{ textAlign: "center", padding: 40 }}>
            Đang tải học phí...
          </p>
        )}

        {/* ✅ Empty state */}
        {!loadingData && selectedHocKyId && !data && (
          <p style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
            Chưa có học phí nào trong học kỳ này
          </p>
        )}

        {/* ✅ Data display */}
        {!loadingData && data && (
          <>
            {/* ========= Table Chưa thanh toán ========= */}
            {data.trangThaiThanhToan === "chua_thanh_toan" && (
              <fieldset className="fieldeset__dkhp mt_20">
                <legend>💰 Học phí chưa thanh toán</legend>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Số tín chỉ</th>
                      <th>Đơn giá</th>
                      <th>Tổng học phí</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{data.soTinChiDangKy}</td>
                      <td>{formatCurrency(data.donGiaTinChi)}/TC</td>
                      <td>
                        <strong style={{ color: "#dc2626" }}>
                          {formatCurrency(data.tongHocPhi)}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="btn__chung"
                          onClick={() => setShowPaymentModal(true)} // ✅ Open modal
                          disabled={creatingPayment}
                          style={{ padding: "6px 16px", fontSize: "14px" }}
                        >
                          💳 Thanh toán học phí
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Chi tiết các môn */}
                <details style={{ marginTop: 16 }}>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#0c4874",
                      marginBottom: 8,
                    }}
                  >
                    Xem chi tiết các môn học
                  </summary>
                  <table className="table" style={{ marginTop: 12 }}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã môn</th>
                        <th>Tên môn</th>
                        <th>Lớp</th>
                        <th>STC</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.chiTiet.map((mon, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{mon.maMon}</td>
                          <td>{mon.tenMon}</td>
                          <td>{mon.maLop}</td>
                          <td>{mon.soTinChi}</td>
                          <td>{formatCurrency(mon.donGia)}</td>
                          <td>{formatCurrency(mon.thanhTien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </fieldset>
            )}

            {/* ========= Table Đã thanh toán ========= */}
            {data.trangThaiThanhToan === "da_thanh_toan" && (
              <fieldset className="fieldeset__dkhp mt_20">
                <legend>✅ Học phí đã thanh toán</legend>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Số tín chỉ</th>
                      <th>Đơn giá</th>
                      <th>Tổng học phí</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{data.soTinChiDangKy}</td>
                      <td>{formatCurrency(data.donGiaTinChi)}/TC</td>
                      <td>
                        <strong style={{ color: "#16a34a" }}>
                          {formatCurrency(data.tongHocPhi)}
                        </strong>
                      </td>
                      <td>
                        <span className="badge-paid">Đã thanh toán</span>
                      </td>
                      <td>
                        <button
                          className="btn__chung"
                          onClick={() => {
                            // ✅ Fix: Use a unique key that always exists
                            const rowKey = `paid_${data.tongHocPhi}`;
                            setExpandedRow(
                              expandedRow === rowKey ? null : rowKey
                            );
                          }}
                          style={{ padding: "6px 16px", fontSize: "14px" }}
                        >
                          👁️{" "}
                          {expandedRow === `paid_${data.tongHocPhi}`
                            ? "Ẩn"
                            : "Xem"}
                        </button>
                      </td>
                    </tr>

                    {/* ✅ Expanded row - Chi tiết */}
                    {expandedRow === `paid_${data.tongHocPhi}` && (
                      <tr>
                        <td colSpan={5}>
                          <table className="table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>STT</th>
                                <th>Mã môn</th>
                                <th>Tên môn</th>
                                <th>Lớp</th>
                                <th>STC</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.chiTiet.map((mon, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{mon.maMon}</td>
                                  <td>{mon.tenMon}</td>
                                  <td>{mon.maLop}</td>
                                  <td>{mon.soTinChi}</td>
                                  <td>{formatCurrency(mon.donGia)}</td>
                                  <td>{formatCurrency(mon.thanhTien)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </fieldset>
            )}
          </>
        )}
      </div>

      {/* ✅ Payment Modal with fallback */}
      {showPaymentModal && data && studentInfo && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          studentInfo={{
            mssv: studentInfo.mssv,
            hoTen: studentInfo.hoTen,
            lop: studentInfo.lop,
            nganh: studentInfo.nganh,
          }}
          paymentInfo={{
            tongHocPhi: data.tongHocPhi,
            soTinChi: data.soTinChiDangKy,
            donGia: data.donGiaTinChi,
          }}
          hocKyId={selectedHocKyId}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </section>
  );
}
