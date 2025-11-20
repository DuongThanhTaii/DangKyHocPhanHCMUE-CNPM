// src/pages/pdt/ControlPanel.tsx
import React, { useState } from "react";
import { useModalContext } from "../../hook/ModalContext";
import "../../styles/reset.css";
import "../../styles/menu.css";

type ControlPanelProps = {
  statuses?: { key: string; label: string }[];
  onSet?: (key: string) => void;
  onReset?: () => void;
};

const DEFAULT_STATUSES = [
  { key: "de_xuat_phe_duyet", label: "Tiền ghi danh (Đề xuất)" },
  { key: "ghi_danh", label: "Ghi danh" },
  { key: "sap_xep_tkb", label: "Sắp xếp thời khóa biểu" },
  { key: "dang_ky_hoc_phan", label: "Đăng ký học phần" },
  { key: "binh_thuong", label: "Bình thường" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ControlPanel({
  statuses = DEFAULT_STATUSES,
  onSet,
  onReset,
}: ControlPanelProps) {
  const { openNotify } = useModalContext();
  const [loading, setLoading] = useState(false);

  // ✅ Toggle phase - gọi API trực tiếp
  const handleTogglePhase = async (phase: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/pdt/ky-phase/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ phase }),
      });

      const json = await response.json();

      if (json.isSuccess) {
        const status = json.data?.isEnabled ? "BẬT" : "TẮT";
        const statusColor = json.data?.isEnabled ? "success" : "warning";

        openNotify({
          message: `✅ Đã ${status} phase: ${json.data?.phase}`,
          type: statusColor,
        });

        // ✅ Call parent callback if provided
        onSet?.(phase);
      } else {
        openNotify({
          message: `❌ ${json.message || "Không thể toggle phase"}`,
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("❌ Toggle phase error:", error);
      openNotify({
        message: `❌ Lỗi: ${error.message || "Không thể kết nối server"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => (onReset ? onReset() : console.log("RESET"));

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">CONTROL PANEL (DEMO)</p>
      </div>

      <div className="body__inner">
        {/* Header */}
        <div className="cp-row cp-row--head">
          <div className="cp-cell">Tên trạng thái</div>
          <div className="cp-cell cp-cell--right">Thao tác</div>
        </div>

        {/* Rows */}
        {statuses.map((st, idx) => (
          <div className="cp-row" key={st.key}>
            <div className="cp-cell">
              <label className="pos__unset cp-label">
                <span className="cp-dot" aria-hidden />
                {st.label}
              </label>
            </div>
            <div className="cp-cell cp-cell--right">
              <button
                type="button"
                className="btn__chung h__40__w__100"
                onClick={() => handleTogglePhase(st.key)}
                disabled={loading}
              >
                {loading ? "..." : "Toggle"}
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="cp-footer">
          <button
            type="button"
            className="btn-cancel h__40__w__100"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        {/* ✅ Note */}
        <p style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>
          <strong>⚠️ Lưu ý:</strong> API này toggle phase của{" "}
          <strong>học kỳ hiện hành</strong>. Chỉ dùng cho mục đích demo/testing.
        </p>
      </div>
    </section>
  );
}
