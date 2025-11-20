import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePaymentStatus } from "../../features/sv/hooks";
import "../../styles/reset.css";
import "../../styles/menu.css";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Extract orderId from DIFFERENT providers
  const orderId =
    searchParams.get("orderId") || // MoMo (custom param)
    searchParams.get("vnp_TxnRef") || // VNPay
    searchParams.get("apptransid") || // ✅ ZaloPay (CRITICAL FIX)
    "";

  const { status, loading, error } = usePaymentStatus(
    orderId,
    20, // ✅ 20 attempts
    1000, // ✅ Every 1s
    2000 // ✅ Wait 2s before first poll
  );

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!orderId) {
      console.error("❌ No orderId found in URL params");
    } else {
      console.log("✅ Extracted orderId:", orderId);
      console.log(
        "📦 Query params:",
        Object.fromEntries(searchParams.entries())
      );
    }
  }, [orderId, searchParams]);

  const handleBackToHome = () => {
    navigate("/sv/thanh-toan-hoc-phi");
  };

  if (!orderId) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">KẾT QUẢ THANH TOÁN</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          <div style={{ fontSize: 64 }}>❌</div>
          <h2 style={{ color: "#dc2626", marginTop: 16 }}>
            Không tìm thấy mã đơn hàng
          </h2>
          <details style={{ marginTop: 20, textAlign: "left" }}>
            <summary style={{ cursor: "pointer", color: "#3b82f6" }}>
              🔍 Debug Info
            </summary>
            <pre
              style={{ background: "#f3f4f6", padding: 16, borderRadius: 8 }}
            >
              {JSON.stringify(
                Object.fromEntries(searchParams.entries()),
                null,
                2
              )}
            </pre>
          </details>
          <button
            className="btn__chung"
            onClick={handleBackToHome}
            style={{ marginTop: 20 }}
          >
            Quay lại
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">KẾT QUẢ THANH TOÁN</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          <div className="loading-spinner">⏳</div>
          <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>
            Đang xác nhận kết quả thanh toán...
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
            OrderID: {orderId}
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">KẾT QUẢ THANH TOÁN</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          <div style={{ fontSize: 64 }}>⚠️</div>
          <h2 style={{ color: "#dc2626", marginTop: 16 }}>Lỗi xác nhận</h2>
          <p style={{ color: "#6b7280", marginTop: 8 }}>{error}</p>
          <button
            className="btn__chung"
            onClick={handleBackToHome}
            style={{ marginTop: 20 }}
          >
            Quay lại
          </button>
        </div>
      </section>
    );
  }

  const isSuccess = status?.status === "success";
  const isPending = status?.status === "pending";
  const isFailed =
    status?.status === "failed" || status?.status === "cancelled";

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">KẾT QUẢ THANH TOÁN</p>
      </div>

      <div className="body__inner" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: 80 }}>
            {isSuccess && "✅"}
            {isPending && "⏳"}
            {isFailed && "❌"}
          </div>

          {/* Title */}
          <h2
            style={{
              marginTop: 16,
              fontSize: 24,
              fontWeight: 600,
              color: isSuccess ? "#16a34a" : isFailed ? "#dc2626" : "#ea580c",
            }}
          >
            {isSuccess && "Thanh toán thành công!"}
            {isPending && "Đang xử lý thanh toán..."}
            {isFailed && "Thanh toán thất bại"}
          </h2>

          {/* Message */}
          <p style={{ marginTop: 8, color: "#6b7280", fontSize: 16 }}>
            {isSuccess && "Học phí của bạn đã được thanh toán"}
            {isPending && "Vui lòng đợi trong giây lát"}
            {isFailed && "Giao dịch không thành công"}
          </p>

          {/* Amount */}
          {status?.amount && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <p style={{ color: "#6b7280", fontSize: 14 }}>Số tiền</p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginTop: 4,
                }}
              >
                {new Intl.NumberFormat("vi-VN").format(status.amount)} ₫
              </p>
            </div>
          )}

          {/* Details (Toggle) */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              marginTop: 16,
              color: "#3b82f6",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {showDetails ? "Ẩn chi tiết ▲" : "Xem chi tiết ▼"}
          </button>

          {showDetails && status && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
                textAlign: "left",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>Mã đơn hàng:</strong> {status.orderId}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Trạng thái:</strong>{" "}
                <span
                  style={{
                    color: isSuccess
                      ? "#16a34a"
                      : isFailed
                      ? "#dc2626"
                      : "#ea580c",
                  }}
                >
                  {status.status}
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(status.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 24 }}>
            <button
              className="btn__chung"
              onClick={handleBackToHome}
              style={{
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {isSuccess ? "Quay lại trang học phí" : "Thử lại"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
