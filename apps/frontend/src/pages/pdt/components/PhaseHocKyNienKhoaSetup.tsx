import { useState, useRef, type FormEvent } from "react";
import {
  useGetDotGhiDanhByHocKy,
  useGetDotDangKyByHocKy,
  useDanhSachKhoa,
  useUpdateDotGhiDanh, // ✅ Add this import
  useUpdateDotDangKy, // ✅ Add this import
} from "../../../features/pdt/hooks";
import { GhiDanhConfig } from "./GhiDanhConfig";
import { DangKyConfig } from "./DangKyConfig";
import type { PhaseConfigRef } from "./PhaseConfigBase";
import type { UpdateDotGhiDanhRequest } from "../../../features/pdt/types/pdtTypes";
import "../../../styles/PhaseHocKyNienKhoaSetup.css";

type PhaseTime = { start: string; end: string };

interface PhaseHocKyNienKhoaSetupProps {
  phaseNames: Record<string, string>;
  phaseOrder: string[];
  phaseTimes: Record<string, PhaseTime>;
  currentPhase: string;
  message: string;
  semesterStart: string;
  semesterEnd: string;
  submitting: boolean;
  selectedHocKyId: string;
  onPhaseTimeChange: (
    phase: string,
    field: "start" | "end",
    value: string
  ) => void;
  onSubmit: (e: FormEvent) => void;
  onSubmitGhiDanh: (data: UpdateDotGhiDanhRequest) => void;
}

export function PhaseHocKyNienKhoaSetup({
  phaseNames,
  phaseOrder,
  phaseTimes,
  currentPhase,
  message,
  submitting,
  selectedHocKyId,
  onPhaseTimeChange,
  onSubmit,
  onSubmitGhiDanh,
}: PhaseHocKyNienKhoaSetupProps) {
  const ghiDanhConfigRef = useRef<PhaseConfigRef>(null);
  const dangKyConfigRef = useRef<PhaseConfigRef>(null);

  const { data: existingDotGhiDanh = [], refetch: refetchDotGhiDanh } =
    useGetDotGhiDanhByHocKy(selectedHocKyId);

  const { data: existingDotDangKy = [], refetch: refetchDotDangKy } =
    useGetDotDangKyByHocKy(selectedHocKyId);

  const { data: danhSachKhoa = [] } = useDanhSachKhoa();

  // ✅ Use hooks correctly
  const { updateDotGhiDanh } = useUpdateDotGhiDanh();
  const { updateDotDangKy } = useUpdateDotDangKy();

  // ✅ Handle Ghi Danh submit
  const handleSubmitGhiDanh = async (data: any) => {
    const result = await updateDotGhiDanh(data);
    if (result.isSuccess) {
      refetchDotGhiDanh();
    }
  };

  // ✅ Handle Đăng Ký submit
  const handleSubmitDangKy = async (data: any) => {
    const result = await updateDotDangKy(data);
    if (result.isSuccess) {
      refetchDotDangKy();
    }
  };

  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [validationError, setValidationError] = useState("");

  // ✅ Format datetime-local to readable Vietnamese format
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "Chưa thiết lập";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStartEdit = (phase: string) => {
    const phaseTime = phaseTimes[phase];
    setEditingPhase(phase);
    setTempStart(phaseTime?.start || "");
    setTempEnd(phaseTime?.end || "");
    setValidationError("");
  };

  const handleSaveEdit = () => {
    if (!editingPhase || !tempStart || !tempEnd) {
      setValidationError("Vui lòng nhập đầy đủ thời gian");
      return;
    }

    const hasOverlap = phaseOrder.some((phase) => {
      if (phase === editingPhase) return false;
      const otherPhase = phaseTimes[phase];
      if (!otherPhase?.start || !otherPhase?.end) return false;

      const newStart = new Date(tempStart);
      const newEnd = new Date(tempEnd);
      const otherStart = new Date(otherPhase.start);
      const otherEnd = new Date(otherPhase.end);

      return (
        (newStart >= otherStart && newStart <= otherEnd) ||
        (newEnd >= otherStart && newEnd <= otherEnd) ||
        (newStart <= otherStart && newEnd >= otherEnd)
      );
    });

    if (hasOverlap) {
      setValidationError("Thời gian trùng với phase khác!");
      return;
    }

    onPhaseTimeChange(editingPhase, "start", tempStart);
    onPhaseTimeChange(editingPhase, "end", tempEnd);
    setEditingPhase(null);
    setValidationError("");
  };

  const handleCancelEdit = () => {
    setEditingPhase(null);
    setTempStart("");
    setTempEnd("");
    setValidationError("");
  };

  return (
    <div className="form-section" style={{ marginTop: "24px" }}>
      <h3 className="sub__title_chuyenphase">Quản lý thời gian các phase</h3>

      <table className="table" style={{ marginTop: "16px" }}>
        <thead>
          <tr>
            <th style={{ width: "25%" }}>Tên phase</th>
            <th style={{ width: "30%" }}>Ngày bắt đầu</th>
            <th style={{ width: "30%" }}>Ngày kết thúc</th>
            <th style={{ width: "15%" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {phaseOrder.map((phase) => {
            const isEditing = editingPhase === phase;
            const phaseTime = phaseTimes[phase];
            const isCurrent = currentPhase === phase;

            return (
              <tr key={phase} className={isCurrent ? "row__highlight" : ""}>
                <td>
                  <strong>{phaseNames[phase] || phase}</strong>
                  {isCurrent && (
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "#16a34a",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      (Hiện tại)
                    </span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      className="form__input"
                      value={tempStart}
                      onChange={(e) => setTempStart(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <span>{formatDateTime(phaseTime?.start)}</span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      className="form__input"
                      value={tempEnd}
                      onChange={(e) => setTempEnd(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <span>{formatDateTime(phaseTime?.end)}</span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="btn__chung"
                        onClick={handleSaveEdit}
                        style={{ padding: "6px 12px", fontSize: "14px" }}
                        disabled={submitting}
                      >
                        ✅
                      </button>
                      <button
                        className="btn__cancel"
                        onClick={handleCancelEdit}
                        style={{ padding: "6px 12px", fontSize: "14px" }}
                        disabled={submitting}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn__chung"
                      onClick={() => handleStartEdit(phase)}
                      style={{ padding: "6px 12px", fontSize: "14px" }}
                      disabled={submitting}
                    >
                      ✏️
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {validationError && (
        <p style={{ color: "red", marginTop: "8px", fontSize: "14px" }}>
          ⚠️ {validationError}
        </p>
      )}

      {message && (
        <p
          style={{
            marginTop: "16px",
            color: message.includes("✅") ? "green" : "red",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>
      )}

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <button
          type="button"
          className="btn__chung"
          onClick={(e) => onSubmit(e as any)}
          disabled={submitting || !selectedHocKyId}
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật trạng thái hệ thống"}
        </button>
      </div>

      {/* ✅ Section Ghi Danh */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "2px solid #0c4874",
          paddingTop: "20px",
        }}
      >
        <GhiDanhConfig
          ref={ghiDanhConfigRef}
          danhSachKhoa={danhSachKhoa}
          phaseStartTime={phaseTimes["ghi_danh"]?.start || ""}
          phaseEndTime={phaseTimes["ghi_danh"]?.end || ""}
          existingData={existingDotGhiDanh}
          hocKyId={selectedHocKyId}
          onSubmit={handleSubmitGhiDanh}
        />
      </div>

      {/* ✅ Section Đăng Ký Học Phần */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "2px solid #0c4874",
          paddingTop: "20px",
        }}
      >
        <DangKyConfig
          ref={dangKyConfigRef}
          danhSachKhoa={danhSachKhoa}
          phaseStartTime={phaseTimes["dang_ky_hoc_phan"]?.start || ""}
          phaseEndTime={phaseTimes["dang_ky_hoc_phan"]?.end || ""}
          existingData={existingDotDangKy}
          hocKyId={selectedHocKyId}
          onSubmit={handleSubmitDangKy}
        />
      </div>
    </div>
  );
}
