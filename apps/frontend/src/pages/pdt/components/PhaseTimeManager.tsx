import { useState } from "react";
import type { PhaseTimeConfigDTO } from "../../../features/pdt/types/pdtTypes";

interface Props {
  ghiDanhTime: PhaseTimeConfigDTO | null;
  dangKyTime: PhaseTimeConfigDTO | null;
  onUpdateTime: (
    phaseType: "ghi_danh" | "dang_ky",
    startDate: string,
    endDate: string
  ) => void;
}

export default function PhaseTimeManager({
  ghiDanhTime,
  dangKyTime,
  onUpdateTime,
}: Props) {
  const [editingPhase, setEditingPhase] = useState<
    "ghi_danh" | "dang_ky" | null
  >(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const handleStartEdit = (phaseType: "ghi_danh" | "dang_ky") => {
    const phaseData = phaseType === "ghi_danh" ? ghiDanhTime : dangKyTime;

    setEditingPhase(phaseType);
    setTempStartDate(
      phaseData?.ngayBatDau
        ? new Date(phaseData.ngayBatDau).toISOString().split("T")[0]
        : ""
    );
    setTempEndDate(
      phaseData?.ngayKetThuc
        ? new Date(phaseData.ngayKetThuc).toISOString().split("T")[0]
        : ""
    );
  };

  const handleSave = () => {
    if (!editingPhase || !tempStartDate || !tempEndDate) return;

    onUpdateTime(editingPhase, tempStartDate, tempEndDate);
    setEditingPhase(null);
  };

  const handleCancel = () => {
    setEditingPhase(null);
    setTempStartDate("");
    setTempEndDate("");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Chưa thiết lập";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: "Đang hoạt động", color: "#16a34a", bg: "#dcfce7" },
      upcoming: { text: "Sắp diễn ra", color: "#ea580c", bg: "#fed7aa" },
      ended: { text: "Đã kết thúc", color: "#dc2626", bg: "#fee2e2" },
    };

    const badge = badges[status as keyof typeof badges] || badges.upcoming;

    return (
      <span
        style={{
          color: badge.color,
          backgroundColor: badge.bg,
          padding: "4px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {badge.text}
      </span>
    );
  };

  const renderPhaseRow = (
    phaseType: "ghi_danh" | "dang_ky",
    label: string,
    phaseData: PhaseTimeConfigDTO | null
  ) => {
    const isEditing = editingPhase === phaseType;

    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <strong style={{ fontSize: "16px" }}>{label}</strong>
          {phaseData && getStatusBadge(phaseData.trangThai)}
        </div>

        {isEditing ? (
          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  className="form__input"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="form__input"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn__chung"
                onClick={handleSave}
                style={{ padding: "8px 16px" }}
              >
                Lưu
              </button>
              <button
                className="btn__cancel"
                onClick={handleCancel}
                style={{ padding: "8px 16px" }}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: "4px 0", color: "#6b7280" }}>
                Từ: <strong>{formatDate(phaseData?.ngayBatDau || null)}</strong>
              </p>
              <p style={{ margin: "4px 0", color: "#6b7280" }}>
                Đến:{" "}
                <strong>{formatDate(phaseData?.ngayKetThuc || null)}</strong>
              </p>
            </div>
            <button
              className="btn__chung"
              onClick={() => handleStartEdit(phaseType)}
              style={{ padding: "8px 12px", fontSize: "14px" }}
            >
              ✏️ Chỉnh sửa
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="form-section" style={{ marginTop: "24px" }}>
      <h3 className="sub__title_chuyenphase">Quản lý thời gian các phase</h3>

      {renderPhaseRow("ghi_danh", "📝 Phase Ghi Danh", ghiDanhTime)}
      {renderPhaseRow("dang_ky", "📚 Phase Đăng Ký Học Phần", dangKyTime)}
    </div>
  );
}
