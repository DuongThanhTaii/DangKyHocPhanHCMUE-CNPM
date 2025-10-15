import { useState, useRef, type FormEvent } from "react";
import {
  useDanhSachKhoa,
  useGetDotGhiDanhByHocKy,
} from "../../../features/pdt/hooks"; // ✅ Add hook
import {
  KhoaConfigSection,
  type KhoaConfigSectionRef,
} from "./KhoaConfigSection";
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

export const PhaseHocKyNienKhoaSetup = ({
  phaseNames,
  phaseOrder,
  phaseTimes,
  currentPhase,
  message,
  semesterStart,
  semesterEnd,
  submitting,
  selectedHocKyId,
  onPhaseTimeChange,
  onSubmit,
  onSubmitGhiDanh,
}: PhaseHocKyNienKhoaSetupProps) => {
  const { data: danhSachKhoa } = useDanhSachKhoa();

  // ✅ Fetch existing đợt ghi danh
  const {
    data: existingDotGhiDanh,
    loading: loadingDotGhiDanh,
    refetch: refetchDotGhiDanh,
  } = useGetDotGhiDanhByHocKy(selectedHocKyId);

  const khoaConfigRef = useRef<KhoaConfigSectionRef>(null);

  // ✅ Log existing data
  console.log("📦 Existing đợt ghi danh:", existingDotGhiDanh);

  const canEditPhase = (phase: string, index: number): boolean => {
    if (index === 0) return true;
    const prevPhase = phaseOrder[index - 1];
    return !!(phaseTimes[prevPhase]?.start && phaseTimes[prevPhase]?.end);
  };

  const getMinMaxForPhase = (
    phase: string,
    field: "start" | "end",
    index: number
  ): { min: string; max: string } => {
    if (field === "start") {
      if (index === 0) return { min: "", max: "" };
      const prevPhase = phaseOrder[index - 1];
      const prevEnd = phaseTimes[prevPhase]?.end;
      return { min: prevEnd || "", max: "" };
    } else {
      const currentStart = phaseTimes[phase]?.start;
      return { min: currentStart || "", max: "" };
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log("🎯 PhaseHocKyNienKhoaSetup handleSubmit CALLED!");
    e.preventDefault();

    if (khoaConfigRef.current) {
      const isValid = khoaConfigRef.current.validate();
      if (!isValid) {
        console.log("❌ Validation failed");
        return;
      }
    }

    console.log("🚀 Calling onSubmit (handleSubmitPhases)...");
    await onSubmit(e);

    console.log("🚀 Getting khoa data for ghi danh...");
    if (khoaConfigRef.current) {
      const khoaData = khoaConfigRef.current.getData();
      console.log("📦 Khoa data:", khoaData);

      // ✅ Get existing IDs
      const toanTruongDot = existingDotGhiDanh.find(
        (dot) => dot.isCheckToanTruong
      );

      const ghiDanhRequest: UpdateDotGhiDanhRequest = {
        hocKyId: selectedHocKyId,
        isToanTruong: khoaData.isToanTruong,
        thoiGianBatDau: khoaData.isToanTruong
          ? new Date(phaseTimes["ghi_danh"]?.start || "").toISOString()
          : undefined,
        thoiGianKetThuc: khoaData.isToanTruong
          ? new Date(phaseTimes["ghi_danh"]?.end || "").toISOString()
          : undefined,
        dotToanTruongId: khoaData.isToanTruong ? toanTruongDot?.id : undefined, // ✅ Include existing ID
        dotTheoKhoa: khoaData.isToanTruong
          ? undefined
          : khoaData.dotTheoKhoa.map((dot) => {
              // ✅ Find existing dot by khoaId
              const existingDot = existingDotGhiDanh.find(
                (existing) => existing.khoaId === dot.khoaId
              );

              return {
                id: existingDot?.id, // ✅ Include existing ID or undefined for new
                khoaId: dot.khoaId,
                thoiGianBatDau: new Date(dot.thoiGianBatDau).toISOString(),
                thoiGianKetThuc: new Date(dot.thoiGianKetThuc).toISOString(),
              };
            }),
      };

      console.log("📦 Ghi danh request with IDs:", ghiDanhRequest);
      await onSubmitGhiDanh(ghiDanhRequest);

      // ✅ Refetch after submit
      refetchDotGhiDanh();
    }
  };

  return (
    <div className="form-section" style={{ marginTop: "2rem" }}>
      <h3 className="sub__title_chuyenphase">
        Thiết lập trạng thái hệ thống theo giai đoạn
      </h3>

      {/* ✅ Show loading state */}
      {loadingDotGhiDanh && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            marginBottom: "10px",
          }}
        >
          Đang tải đợt ghi danh hiện tại...
        </div>
      )}

      <form className="search-form phases-form" onSubmit={handleSubmit}>
        {phaseOrder.map((phaseKey, index) => {
          const phaseTime = phaseTimes[phaseKey] || { start: "", end: "" };
          const canEdit = canEditPhase(phaseKey, index);
          const minMaxStart = canEdit
            ? getMinMaxForPhase(phaseKey, "start", index)
            : { min: "", max: "" };
          const minMaxEnd = canEdit
            ? getMinMaxForPhase(phaseKey, "end", index)
            : { min: "", max: "" };

          const isGhiDanhPhase = phaseKey === "ghi_danh";

          return (
            <div key={phaseKey} style={{ marginBottom: "2rem" }}>
              <div className="phase-row">
                <div className="form__group" style={{ marginBottom: 0 }}>
                  <div
                    className="form__select"
                    style={{ padding: "10px 12px" }}
                  >
                    <strong>{phaseNames[phaseKey]}</strong>
                    {currentPhase === phaseKey && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "var(--green, #1A9E55)",
                        }}
                      >
                        (đang mở)
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="form__group form__group__ctt"
                  style={{ marginBottom: 0 }}
                >
                  <input
                    type="datetime-local"
                    className="form__input"
                    style={{ backgroundColor: canEdit ? "white" : "#f5f5f5" }}
                    value={phaseTime.start}
                    onChange={(e) =>
                      onPhaseTimeChange(phaseKey, "start", e.target.value)
                    }
                    disabled={!canEdit}
                    required={canEdit}
                    min={minMaxStart.min}
                    max={minMaxStart.max}
                  />
                  <label className="form__floating-label">Bắt đầu</label>
                </div>

                <div
                  className="form__group form__group__ctt"
                  style={{ marginBottom: 0 }}
                >
                  <input
                    type="datetime-local"
                    className="form__input"
                    style={{ backgroundColor: canEdit ? "white" : "#f5f5f5" }}
                    value={phaseTime.end}
                    onChange={(e) =>
                      onPhaseTimeChange(phaseKey, "end", e.target.value)
                    }
                    disabled={!canEdit}
                    required={canEdit}
                    min={minMaxEnd.min}
                    max={minMaxEnd.max}
                  />
                  <label className="form__floating-label">Kết thúc</label>
                </div>
              </div>

              {isGhiDanhPhase && (
                <KhoaConfigSection
                  ref={khoaConfigRef}
                  danhSachKhoa={danhSachKhoa}
                  phaseStartTime={phaseTime.start || ""}
                  phaseEndTime={phaseTime.end || ""}
                  existingDotGhiDanh={existingDotGhiDanh} // ✅ Pass existing data
                />
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="form__button btn__chung"
          style={{ marginTop: "20px" }}
          disabled={false} // ✅ BYPASS for now
        >
          {submitting ? "Đang xử lý..." : "Cập nhật trạng thái"}
        </button>
      </form>

      <p className="phase-status">
        Trạng thái hiện tại:{" "}
        <strong>{phaseNames[currentPhase] || "Không xác định"}</strong>
      </p>
      {message && (
        <p
          className={`phase-message ${
            message.includes("✅")
              ? "phase-message--success"
              : "phase-message--error"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};
