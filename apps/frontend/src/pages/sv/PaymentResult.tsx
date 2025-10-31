import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { usePaymentStatus } from "../../features/sv/hooks";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId") || "";
  const resultCode = searchParams.get("resultCode") || "";
  const message = searchParams.get("message") || "";

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const shouldPoll = resultCode === "0";
  const [manualRefetchTrigger, setManualRefetchTrigger] = useState(0);

  // ✅ Use pollCount from usePaymentStatus hook
  const { data: paymentStatus, loading, pollCount } = usePaymentStatus(
    orderId,
    shouldPoll || manualRefetchTrigger > 0
  );

  const handleManualRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setManualRefetchTrigger((prev) => prev + 1);
  };

  // ✅ FIX: Map backend status → FE display status
  const finalStatus = useMemo(() => {
    // ❌ Case 1: MoMo trả failed (resultCode !== "0")
    if (resultCode !== "0") {
      return "failed";
    }

    // ✅ Case 2: MoMo trả success, chờ backend confirm
    if (!paymentStatus) {
      return "processing"; // Đang poll backend
    }

    // ✅ Case 3: Backend trả về status
    // Map: "pending" → "processing", "success" → "success", others → "failed"
    if (paymentStatus.status === "success") {
      return "success";
    } else if (paymentStatus.status === "pending") {
      return "processing";
    } else if (paymentStatus.status === "cancelled") {
      return "cancelled";
    } else {
      return "failed";
    }
  }, [paymentStatus, resultCode]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // ✅ Handle navigation based on auth state
  const handleNavigateBack = () => {
    if (isAuthenticated) {
      navigate("/sv/thanh-toan-hoc-phi");
    } else {
      navigate("/"); // Redirect to login
    }
  };

  // ✅ Render based on status
  const renderContent = () => {
    if (loading && !paymentStatus) {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #0c4874",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ marginTop: 16, fontSize: "16px", color: "#6b7280" }}>
            Đang xác nhận thanh toán...
          </p>
        </div>
      );
    }

    // ✅ Update processing state UI
    if (finalStatus === "processing") {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
            <path
              d="M12 6v6l4 2"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h2 style={{ marginTop: 24, fontSize: "24px", color: "#f59e0b" }}>
            Đang xử lý thanh toán
          </h2>
          <p style={{ marginTop: 12, color: "#6b7280" }}>
            Giao dịch của bạn đang được xác nhận. Vui lòng đợi trong giây lát...
          </p>
          {orderId && (
            <p style={{ marginTop: 8, fontSize: "14px", color: "#9ca3af" }}>
              Mã giao dịch: <strong>{orderId}</strong>
            </p>
          )}

          <button
            onClick={handleManualRefresh}
            className="btn__chung"
            style={{
              marginTop: "24px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
            disabled={loading}
          >
            {loading ? "Đang kiểm tra..." : "🔄 Kiểm tra lại"}
          </button>

          {/* ✅ Use pollCount from hook */}
          {pollCount > 10 && (
            <div
              style={{
                marginTop: 24,
                padding: "12px 16px",
                background: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "6px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>
                ⚠️ Giao dịch đang mất nhiều thời gian hơn dự kiến. Vui lòng kiểm
                tra lại sau hoặc liên hệ hỗ trợ nếu cần.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (finalStatus === "success") {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="2" />
            <path
              d="M8 12l2 2 4-4"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 style={{ marginTop: 24, fontSize: "24px", color: "#16a34a" }}>
            Thanh toán thành công!
          </h2>
          <p style={{ marginTop: 12, color: "#6b7280" }}>
            Học phí của bạn đã được thanh toán thành công.
          </p>
          {paymentStatus && (
            <div
              style={{
                marginTop: 24,
                padding: "20px",
                background: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #16a34a",
                maxWidth: "400px",
                margin: "24px auto 0",
              }}
            >
              <p style={{ margin: "8px 0", color: "#15803d" }}>
                <strong>Mã giao dịch:</strong> {orderId}
              </p>
              <p style={{ margin: "8px 0", color: "#15803d" }}>
                <strong>Số tiền:</strong> {formatCurrency(paymentStatus.amount)}
              </p>
              <p style={{ margin: "8px 0", color: "#15803d" }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(paymentStatus.updatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h2 style={{ marginTop: 24, fontSize: "24px", color: "#dc2626" }}>
          {finalStatus === "cancelled"
            ? "Giao dịch đã hủy"
            : "Thanh toán thất bại"}
        </h2>
        <p style={{ marginTop: 12, color: "#6b7280" }}>
          {message || "Giao dịch không thành công. Vui lòng thử lại."}
        </p>
        {orderId && (
          <p style={{ marginTop: 8, fontSize: "14px", color: "#9ca3af" }}>
            Mã giao dịch: <strong>{orderId}</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "40px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <div
          style={{
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "16px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0c4874",
              textAlign: "center",
              margin: 0,
            }}
          >
            KẾT QUẢ THANH TOÁN
          </h1>
        </div>

        {renderContent()}

        {/* Action buttons */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            className="btn__chung"
            onClick={handleNavigateBack}
            style={{ padding: "12px 32px", fontSize: "16px" }}
          >
            {isAuthenticated ? "Về trang học phí" : "Đăng nhập lại"}
          </button>

          {finalStatus === "success" && isAuthenticated && (
            <button
              className="btn__chung"
              onClick={() => alert("Tính năng tải hoá đơn đang phát triển")}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                marginLeft: "12px",
                background: "#3b82f6",
              }}
            >
              📄 Tải hoá đơn
            </button>
          )}
        </div>

        {/* ✅ Warning if not authenticated */}
        {!isAuthenticated && (
          <div
            style={{
              marginTop: 24,
              padding: "12px 16px",
              background: "#fef3c7",
              border: "1px solid #fbbf24",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>
              ⚠️ Phiên đăng nhập đã hết. Vui lòng đăng nhập lại để xem chi tiết
              học phí.
            </p>
          </div>
        )}
      </div>

      {/* ✅ Add CSS animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
