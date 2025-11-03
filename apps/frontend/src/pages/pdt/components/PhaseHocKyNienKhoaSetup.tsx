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

    const newStart = new Date(tempStart);
    const newEnd = new Date(tempEnd);

    // ✅ Kiểm tra thời gian hợp lệ
    if (newEnd <= newStart) {
      setValidationError("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    // ✅ Kiểm tra overlap với các phase khác
    const hasOverlap = phaseOrder.some((phase) => {
      if (phase === editingPhase) return false;
      const otherPhase = phaseTimes[phase];
      if (!otherPhase?.start || !otherPhase?.end) return false;

      const otherStart = new Date(otherPhase.start);
      const otherEnd = new Date(otherPhase.end);

      // Hai khoảng KHÔNG overlap khi:
      // - Phase mới kết thúc trước/bằng khi phase khác bắt đầu
      // - HOẶC phase khác kết thúc trước/bằng khi phase mới bắt đầu
      const noOverlap = newEnd <= otherStart || otherEnd <= newStart;

      return !noOverlap; // Có overlap khi KHÔNG thỏa điều kiện noOverlap
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
                        className="btn__update m__0 df_center h__35__w__35"
                        onClick={handleSaveEdit}
                        disabled={submitting}
                      >
                        <svg
                          className=""
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="#ffffff"
                            d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
                          />
                        </svg>
                      </button>
                      <button
                        className="khoa-config-item__remove-btn h__35__w__35"
                        onClick={handleCancelEdit}
                        style={{ padding: "6px 12px", fontSize: "14px" }}
                        disabled={submitting}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path
                            fill="#ffffff"
                            d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="df_center">
                      <button
                        className="btn__update h__35__w__35"
                        onClick={() => handleStartEdit(phase)}
                        disabled={submitting}
                      >
                        <svg
                          className="df_center"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                        >
                          <path
                            fill="currentColor"
                            d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"
                          ></path>
                        </svg>
                      </button>
                    </div>
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

      <div style={{ marginTop: "16px" }}>
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
          marginTop: "25px",
          borderTop: "1px solid #ccc",
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
          marginTop: "25px",
          borderTop: "1px solid #ccc",
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
