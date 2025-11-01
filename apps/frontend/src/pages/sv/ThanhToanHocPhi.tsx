import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useHocPhi, useCreatePayment } from "../../features/sv/hooks";
import { useGetHocKyHienHanh } from "../../features/pdt/hooks/useGetHocKyHienHanh";
import { useHocKyNienKhoa } from "../../features/pdt/hooks/useHocKyNienKhoa";
import type { HocKyDTO } from "../../features/pdt/types/pdtTypes";
import { useModalContext } from "../../hook/ModalContext";
import PaymentModal from "./components/payment/PaymentModal";
import { getStudentInfoFromJWT } from "../../utils/jwtUtils";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

export default function ThanhToanHocPhi() {
  const { openNotify, openConfirm } = useModalContext();

  // ========= Custom Hooks =========
  const { data: hocKyHienHanh, loading: loadingHocKyHienHanh } =
    useGetHocKyHienHanh();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();
  const { createPayment, loading: creatingPayment } = useCreatePayment(); 

  // ========= State =========
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ Helper function to fix broken UTF-8 encoding
  const fixUTF8 = (str: string): string => {
    try {
      // Decode double-encoded UTF-8
      return decodeURIComponent(escape(str));
    } catch {
      return str; 
    }
  };

  // ✅ Use utility 
  const studentInfo = getStudentInfoFromJWT();

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

  // ========= Computed Values =========
  const nienKhoas = useMemo(
    () => Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))),
    [hocKyNienKhoas]
  );

  const flatHocKys = useMemo(() => {
    const result: (HocKyDTO & { tenNienKhoa: string })[] = [];

    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({
          ...hk,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        });
      });
    });

    return result;
  }, [hocKyNienKhoas]);

  // ========= Fetch Học phí =========
  const {
    data,
    loading: loadingData,
    submitting,
    thanhToan,
  } = useHocPhi(selectedHocKyId);

  // ========= Auto-select học kỳ hiện hành =========
  useEffect(() => {
    if (hocKyHienHanh && flatHocKys.length > 0 && !selectedHocKyId) {
      const hkHienHanh = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

      if (hkHienHanh) {
        setSelectedNienKhoa(hkHienHanh.tenNienKhoa);
        setSelectedHocKyId(hkHienHanh.id);
      }
    }
  }, [hocKyHienHanh, flatHocKys, selectedHocKyId]);

  // ========= Reset học kỳ khi đổi niên khóa =========
  useEffect(() => {
    setSelectedHocKyId("");
  }, [selectedNienKhoa]);

  // ========= Handle thanh toán =========
  const handleThanhToan = async () => {
    if (!selectedHocKyId || !data) return;

    const confirmed = await openConfirm({
      message: `Bạn chắc chắn muốn thanh toán học phí qua MoMo?\n\nTổng tiền: ${formatCurrency(
        data.tongHocPhi
      )}`,
      confirmText: "Thanh toán",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    // ✅ ONLY send hocKyId - BE tự tính amount từ DB
    const result = await createPayment({
      hocKyId: selectedHocKyId,
      // ❌ REMOVE: amount: data.tongHocPhi
    });

    if (result.success && result.data) {
      console.log("🔗 Redirecting to MoMo:", result.data.payUrl);
      window.location.href = result.data.payUrl;
    }
  };

  // ========= Render Loading =========
  if (loadingHocKy || loadingHocKyHienHanh) {
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
        {/* ✅ Filters */}
        <div className="selecy__duyethp__container">
          {/* Niên khóa */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedNienKhoa}
              onChange={(e) => setSelectedNienKhoa(e.target.value)}
            >
              <option value="">-- Chọn Niên khóa --</option>
              {nienKhoas.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
                </option>
              ))}
            </select>
          </div>

          {/* Học kỳ */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedHocKyId}
              onChange={(e) => setSelectedHocKyId(e.target.value)}
              disabled={!selectedNienKhoa}
            >
              <option value="">-- Chọn Học kỳ --</option>
              {flatHocKys
                .filter((hk) => hk.tenNienKhoa === selectedNienKhoa)
                .map((hk) => (
                  <option key={hk.id} value={hk.id}>
                    {hk.tenHocKy}
                  </option>
                ))}
            </select>
          </div>
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
