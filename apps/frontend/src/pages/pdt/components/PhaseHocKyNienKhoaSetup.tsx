import type { FormEvent } from "react";

type PhaseTime = { start: string; end: string };

type PhaseHocKyNienKhoaSetupProps = {
  phaseNames: Record<string, string>;
  phaseOrder: string[];
  phaseTimes: Record<string, PhaseTime>;
  currentPhase: string;
  message: string;
  semesterStart: string;
  semesterEnd: string;
  submitting: boolean;
  onPhaseTimeChange: (
    phase: string,
    field: "start" | "end",
    value: string
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const PhaseHocKyNienKhoaSetup = ({
  phaseNames,
  phaseOrder,
  phaseTimes,
  currentPhase,
  message,
  semesterStart,
  semesterEnd,
  submitting,
  onPhaseTimeChange,
  onSubmit,
}: PhaseHocKyNienKhoaSetupProps) => {
  // Kiểm tra phase nào có thể nhập
  const canEditPhase = (phaseKey: string, index: number): boolean => {
    // Nếu đang submit thì disable tất cả
    if (submitting) return false;

    // Nếu chưa set học kỳ (ngày bắt đầu/kết thúc) -> không cho set phase nào
    if (!semesterStart || !semesterEnd) {
      return false;
    }

    // Phase đầu tiên luôn được nhập
    if (index === 0) return true;

    // Phase sau chỉ được nhập nếu phase trước đã set đủ start & end
    const prevPhase = phaseOrder[index - 1];
    const prevTime = phaseTimes[prevPhase];
    return !!(prevTime?.start && prevTime?.end);
  };

  // Lấy min/max cho datetime-local input
  const getMinMaxForPhase = (
    phaseKey: string,
    field: "start" | "end",
    index: number
  ) => {
    const semesterStartDate = semesterStart ? `${semesterStart}T00:00` : "";
    const semesterEndDate = semesterEnd ? `${semesterEnd}T23:59` : "";

    if (field === "start") {
      // Start phải >= semester start
      // Nếu có phase trước, start >= end của phase trước
      if (index > 0) {
        const prevPhase = phaseOrder[index - 1];
        const prevEnd = phaseTimes[prevPhase]?.end;
        return {
          min: prevEnd || semesterStartDate,
          max: semesterEndDate,
        };
      }
      return {
        min: semesterStartDate,
        max: semesterEndDate,
      };
    } else {
      // End phải > start của chính nó, <= semester end
      const currentStart = phaseTimes[phaseKey]?.start;
      return {
        min: currentStart || semesterStartDate,
        max: semesterEndDate,
      };
    }
  };

  return (
    <div className="form-section" style={{ marginTop: "2rem" }}>
      <h3 className="sub__title_chuyenphase">
        Thiết lập trạng thái hệ thống theo giai đoạn
      </h3>

      <form className="search-form phases-form" onSubmit={onSubmit}>
        {phaseOrder.map((phaseKey, index) => {
          const canEdit = canEditPhase(phaseKey, index);
          const minMaxStart = canEdit
            ? getMinMaxForPhase(phaseKey, "start", index)
            : { min: "", max: "" };
          const minMaxEnd = canEdit
            ? getMinMaxForPhase(phaseKey, "end", index)
            : { min: "", max: "" };

          return (
            <div key={phaseKey} className="phase-row">
              <div className="form__group" style={{ marginBottom: 0 }}>
                <div className="form__select" style={{ padding: "10px 12px" }}>
                  <strong>{phaseNames[phaseKey]}</strong>
                  {currentPhase === phaseKey ? (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--green, #1A9E55)",
                      }}
                    >
                      (đang mở)
                    </span>
                  ) : null}
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
                  value={phaseTimes[phaseKey].start}
                  onChange={(e) =>
                    onPhaseTimeChange(phaseKey, "start", e.target.value)
                  }
                  disabled={!canEdit}
                  required={canEdit}
                  min={minMaxStart.min}
                  max={minMaxStart.max}
                  title={
                    !canEdit && index > 0
                      ? `Vui lòng hoàn thành phase "${
                          phaseNames[phaseOrder[index - 1]]
                        }" trước`
                      : !canEdit && !semesterStart
                      ? "Vui lòng thiết lập học kỳ trước"
                      : ""
                  }
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
                  value={phaseTimes[phaseKey].end}
                  onChange={(e) =>
                    onPhaseTimeChange(phaseKey, "end", e.target.value)
                  }
                  disabled={!canEdit}
                  required={canEdit}
                  min={minMaxEnd.min}
                  max={minMaxEnd.max}
                  title={
                    !canEdit && index > 0
                      ? `Vui lòng hoàn thành phase "${
                          phaseNames[phaseOrder[index - 1]]
                        }" trước`
                      : !canEdit && !semesterStart
                      ? "Vui lòng thiết lập học kỳ trước"
                      : ""
                  }
                />
                <label className="form__floating-label">Kết thúc</label>
              </div>
            </div>
          );
        })}

        {/* Nút chuyển đặt dưới cùng */}
        <button
          type="submit"
          className="form__button btn__chung"
          style={{ marginTop: "20px" }}
          disabled={!semesterStart || !semesterEnd || submitting}
        >
          {submitting ? (
            "Đang xử lý..."
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                <path
                  d="M15.8331 14.5H15.0431L14.7631 14.23C15.7431 13.09 16.3331 11.61 16.3331 10C16.3331 6.41 13.4231 3.5 9.83313 3.5C6.24313 3.5 3.33313 6.41 3.33313 10C3.33313 13.59 6.24313 16.5 9.83313 16.5C11.4431 16.5 12.9231 15.91 14.0631 14.93L14.3331 15.21V16L19.3331 20.99L20.8231 19.5L15.8331 14.5ZM9.83313 14.5C7.34313 14.5 5.33313 12.49 5.33313 10C5.33313 7.51 7.34313 5.5 9.83313 5.5C12.3231 5.5 14.3331 7.51 14.3331 10C14.3331 12.49 12.3231 14.5 9.83313 14.5Z"
                  fill="currentColor"
                />
              </svg>
              Cập nhật trạng thái
            </>
          )}
        </button>
      </form>

      <p className="phase" style={{ marginTop: "10px" }}>
        Trạng thái hiện tại:{" "}
        <strong>{phaseNames[currentPhase] || "Không xác định"}</strong>
      </p>
      {message && (
        <p
          style={{
            color: message.includes("✅") ? "green" : "red",
            marginTop: 4,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};
