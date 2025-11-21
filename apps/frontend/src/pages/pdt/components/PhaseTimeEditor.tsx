import { useState } from "react";

interface PhaseData {
  label: string;
  start: string;
  end: string;
  status: "active" | "upcoming" | "ended";
}

interface Props {
  ghiDanhPhase: PhaseData;
  dangKyPhase: PhaseData;
  onUpdate: (
    phaseType: "ghi_danh" | "dang_ky",
    start: string,
    end: string
  ) => void;
}

export default function PhaseTimeEditor({
  ghiDanhPhase,
  dangKyPhase,
  onUpdate,
}: Props) {
  const [editingPhase, setEditingPhase] = useState<
    "ghi_danh" | "dang_ky" | null
  >(null);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");

  const startEdit = (phaseType: "ghi_danh" | "dang_ky", phase: PhaseData) => {
    setEditingPhase(phaseType);
    setTempStart(phase.start);
    setTempEnd(phase.end);
  };

  const saveEdit = () => {
    if (!editingPhase || !tempStart || !tempEnd) return;
    onUpdate(editingPhase, tempStart, tempEnd);
    setEditingPhase(null);
  };

  const cancelEdit = () => {
    setEditingPhase(null);
    setTempStart("");
    setTempEnd("");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { text: "Đang hoạt động", color: "#16a34a", bg: "#dcfce7" },
      upcoming: { text: "Sắp diễn ra", color: "#ea580c", bg: "#fed7aa" },
      ended: { text: "Đã kết thúc", color: "#dc2626", bg: "#fee2e2" },
    };
    const style = styles[status as keyof typeof styles] || styles.upcoming;

    return (
      <span
        style={{
          color: style.color,
          backgroundColor: style.bg,
          padding: "4px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {style.text}
      </span>
    );
  };

  const renderPhaseRow = (
    phaseType: "ghi_danh" | "dang_ky",
    phase: PhaseData
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
          <strong style={{ fontSize: "16px" }}>{phase.label}</strong>
          {getStatusBadge(phase.status)}
        </div>

        {isEditing ? (
          <div>
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
                  type="datetime-local"
                  className="form__input"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
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
                  type="datetime-local"
                  className="form__input"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn__chung"
                onClick={saveEdit}
                style={{ padding: "8px 16px" }}
              >
                Lưu
              </button>
              <button
                className="btn__cancel"
                onClick={cancelEdit}
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
                Từ: <strong>{phase.start || "Chưa thiết lập"}</strong>
              </p>
              <p style={{ margin: "4px 0", color: "#6b7280" }}>
                Đến: <strong>{phase.end || "Chưa thiết lập"}</strong>
              </p>
            </div>
            <button
              className="btn__chung"
              onClick={() => startEdit(phaseType, phase)}
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
      {renderPhaseRow("ghi_danh", ghiDanhPhase)}
      {renderPhaseRow("dang_ky", dangKyPhase)}
    </div>
  );
}
