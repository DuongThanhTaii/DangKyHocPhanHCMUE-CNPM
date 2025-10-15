import { useState, type FormEvent } from "react";
import { useDanhSachKhoa } from "../../../features/pdt/hooks";
import type { KhoaDTO } from "../../../features/pdt/types/pdtTypes";
import "../../../styles/PhaseHocKyNienKhoaSetup.css";
type PhaseTime = { start: string; end: string };

type KhoaPhaseConfig = {
  id: string;
  khoaIds: string[];
  start: string;
  end: string;
};

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
  onValidateKhoaConfigs?: () => boolean; // ✅ Optional callback
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
  const { data: danhSachKhoa } = useDanhSachKhoa();

  console.log("🔍 Component render"); // ✅ Debug 1
  console.log("🔍 danhSachKhoa:", danhSachKhoa); // ✅ Debug 2
  console.log("🔍 phaseOrder:", phaseOrder); // ✅ Debug 3

  // ✅ Chỉ áp dụng cho phase "ghi_danh"
  const [apDungChungGhiDanh, setApDungChungGhiDanh] = useState(true);

  // ✅ Config khoa chỉ cho phase "ghi_danh"
  const [khoaConfigsGhiDanh, setKhoaConfigsGhiDanh] = useState<
    KhoaPhaseConfig[]
  >([]);

  // ✅ State lưu lỗi validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Lấy danh sách khoa đã chọn
  const getSelectedKhoaIds = (): string[] => {
    return khoaConfigsGhiDanh.flatMap((c) => c.khoaIds);
  };

  // Lấy khoa available (chưa được chọn)
  const getAvailableKhoa = (): KhoaDTO[] => {
    const selectedIds = getSelectedKhoaIds();
    return danhSachKhoa.filter((k) => !selectedIds.includes(k.id));
  };

  // Thêm 1 row config khoa
  const addKhoaConfig = () => {
    setKhoaConfigsGhiDanh((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        khoaIds: [],
        start: "",
        end: "",
      },
    ]);
  };

  // Xóa 1 row config khoa
  const removeKhoaConfig = (configId: string) => {
    setKhoaConfigsGhiDanh((prev) => prev.filter((c) => c.id !== configId));
  };

  // ✅ Update config và validate
  const updateKhoaConfig = (
    configId: string,
    field: keyof KhoaPhaseConfig,
    value: any
  ) => {
    setKhoaConfigsGhiDanh((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, [field]: value } : c))
    );

    // Clear error khi đang nhập
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${configId}-${field}`];
      return newErrors;
    });
  };

  // Toggle chọn khoa
  const toggleKhoa = (configId: string, khoaId: string) => {
    setKhoaConfigsGhiDanh((prev) =>
      prev.map((c) => {
        if (c.id !== configId) return c;

        const isSelected = c.khoaIds.includes(khoaId);
        return {
          ...c,
          khoaIds: isSelected
            ? c.khoaIds.filter((id) => id !== khoaId)
            : [...c.khoaIds, khoaId],
        };
      })
    );
  };

  // Validate thời gian không xâm phạm
  const validateKhoaConfigTime = (
    configId: string,
    field: "start" | "end"
  ): { min: string; max: string } => {
    const currentIndex = khoaConfigsGhiDanh.findIndex((c) => c.id === configId);
    const currentConfig = khoaConfigsGhiDanh[currentIndex];

    const phaseStart = phaseTimes["ghi_danh"]?.start || "";
    const phaseEnd = phaseTimes["ghi_danh"]?.end || "";

    if (field === "start") {
      if (currentIndex > 0) {
        const prevConfig = khoaConfigsGhiDanh[currentIndex - 1];
        return {
          min: prevConfig.end || phaseStart,
          max: phaseEnd,
        };
      }
      return { min: phaseStart, max: phaseEnd };
    } else {
      return {
        min: currentConfig?.start || phaseStart,
        max: phaseEnd,
      };
    }
  };

  // ✅ Validate toàn bộ configs
  const validateAllKhoaConfigs = (): boolean => {
    if (khoaConfigsGhiDanh.length === 0) return true; // ✅ Không có config -> valid

    const errors: Record<string, string> = {};
    const phaseStart = new Date(phaseTimes["ghi_danh"]?.start || "");
    const phaseEnd = new Date(phaseTimes["ghi_danh"]?.end || "");

    khoaConfigsGhiDanh.forEach((config, index) => {
      // Check khoa chưa chọn
      if (config.khoaIds.length === 0) {
        errors[`${config.id}-khoa`] = "Vui lòng chọn ít nhất 1 khoa";
      }

      // Check thời gian trống
      if (!config.start) {
        errors[`${config.id}-start`] = "Vui lòng nhập thời gian bắt đầu";
        return; // Skip các check khác
      }
      if (!config.end) {
        errors[`${config.id}-end`] = "Vui lòng nhập thời gian kết thúc";
        return;
      }

      const configStart = new Date(config.start);
      const configEnd = new Date(config.end);

      // Check end > start
      if (configEnd <= configStart) {
        errors[`${config.id}-end`] =
          "Thời gian kết thúc phải sau thời gian bắt đầu";
      }

      // Check nằm trong khoảng ghi danh
      if (configStart < phaseStart) {
        errors[`${config.id}-start`] =
          "Không được sớm hơn thời gian bắt đầu ghi danh";
      }
      if (configEnd > phaseEnd) {
        errors[`${config.id}-end`] =
          "Không được trễ hơn thời gian kết thúc ghi danh";
      }

      // Check không xâm lấn config trước
      if (index > 0) {
        const prevConfig = khoaConfigsGhiDanh[index - 1];
        if (prevConfig.end) {
          const prevEnd = new Date(prevConfig.end);
          if (configStart < prevEnd) {
            errors[`${config.id}-start`] =
              "Thời gian bắt đầu phải sau khi mốc trước kết thúc";
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canEditPhase = (phaseKey: string, index: number): boolean => {
    if (submitting) return false;
    if (!semesterStart || !semesterEnd) return false;
    if (index === 0) return true;

    const prevPhase = phaseOrder[index - 1];
    const prevTime = phaseTimes[prevPhase];
    return !!(prevTime?.start && prevTime?.end);
  };

  const getMinMaxForPhase = (
    phaseKey: string,
    field: "start" | "end",
    index: number
  ) => {
    const semesterStartDate = semesterStart ? `${semesterStart}T00:00` : "";
    const semesterEndDate = semesterEnd ? `${semesterEnd}T23:59` : "";

    if (field === "start") {
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
      const currentStart = phaseTimes[phaseKey]?.start;
      return {
        min: currentStart || semesterStartDate,
        max: semesterEndDate,
      };
    }
  };

  const availableKhoa = getAvailableKhoa();
  console.log("🔍 availableKhoa:", availableKhoa); // ✅ Debug 4

  return (
    <div className="form-section" style={{ marginTop: "2rem" }}>
      <h3 className="sub__title_chuyenphase">
        Thiết lập trạng thái hệ thống theo giai đoạn
      </h3>
      <form
        className="search-form phases-form"
        onSubmit={(e) => {
          // ✅ Validate trước khi submit
          if (!apDungChungGhiDanh) {
            const isValid = validateAllKhoaConfigs();
            if (!isValid) {
              e.preventDefault();
              return;
            }
          }
          onSubmit(e);
        }}
      >
        {phaseOrder.map((phaseKey, index) => {

          const canEdit = canEditPhase(phaseKey, index);
          const minMaxStart = canEdit
            ? getMinMaxForPhase(phaseKey, "start", index)
            : { min: "", max: "" };
          const minMaxEnd = canEdit
            ? getMinMaxForPhase(phaseKey, "end", index)
            : { min: "", max: "" };

          const isGhiDanhPhase = phaseKey === "ghi_danh";
          console.log(
            "🔍 isGhiDanhPhase:",
            isGhiDanhPhase,
            "canEdit:",
            canEdit,
            "apDungChung:",
            apDungChungGhiDanh
          ); // ✅ Debug 7

          return (
            <div key={phaseKey} style={{ marginBottom: "2rem" }}>
              {/* Row chính - CHỈ có 3 phần: tên phase, time start, time end */}
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

                {/* Input thời gian bắt đầu */}
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
                  />
                  <label className="form__floating-label">Bắt đầu</label>
                </div>

                {/* Input thời gian kết thúc */}
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
                  />
                  <label className="form__floating-label">Kết thúc</label>
                </div>
              </div>

              {/* ✅ Checkbox BÊN NGOÀI .phase-row */}
              {isGhiDanhPhase && (
                <div className="phase-checkbox-wrapper">
                  <label className="phase-checkbox-label">
                    <input
                      type="checkbox"
                      checked={apDungChungGhiDanh}
                      onChange={(e) => {
                        console.log("✅ Checkbox changed:", e.target.checked);
                        setApDungChungGhiDanh(e.target.checked);
                      }}
                    />
                    <span>Áp dụng chung toàn trường</span>
                  </label>
                </div>
              )}

              {/* ✅ Config theo khoa */}
              {isGhiDanhPhase && !apDungChungGhiDanh && (
                <div className="khoa-config-container">
                  <p className="khoa-config-title">
                    Thiết lập riêng cho từng khoa:
                  </p>

                  {khoaConfigsGhiDanh.map((config, configIndex) => {
                    const minMax = validateKhoaConfigTime(config.id, "start");
                    const minMaxEnd = validateKhoaConfigTime(config.id, "end");

                    const startError = validationErrors[`${config.id}-start`];
                    const endError = validationErrors[`${config.id}-end`];
                    const khoaError = validationErrors[`${config.id}-khoa`];

                    return (
                      <div key={config.id} className="khoa-config-row">
                        {/* Dropdown chọn khoa */}
                        <div className="khoa-select-container">
                          <label className="khoa-select-label">
                            Chọn khoa:
                          </label>
                          <div
                            className="khoa-select-box"
                            style={{
                              borderColor: khoaError ? "#bf2e29" : "#d0d0d0",
                            }}
                          >
                            {availableKhoa.map((khoa) => (
                              <label key={khoa.id} className="khoa-select-item">
                                <input
                                  type="checkbox"
                                  checked={config.khoaIds.includes(khoa.id)}
                                  onChange={() =>
                                    toggleKhoa(config.id, khoa.id)
                                  }
                                />
                                {khoa.tenKhoa}
                              </label>
                            ))}
                            {config.khoaIds.map((khoaId) => {
                              const khoa = danhSachKhoa.find(
                                (k) => k.id === khoaId
                              );
                              if (!khoa) return null;
                              return (
                                <label
                                  key={khoaId}
                                  className="khoa-select-item khoa-select-item--selected"
                                >
                                  <input
                                    type="checkbox"
                                    checked
                                    onChange={() =>
                                      toggleKhoa(config.id, khoaId)
                                    }
                                  />
                                  {khoa.tenKhoa} ✓
                                </label>
                              );
                            })}
                          </div>
                          {khoaError && (
                            <span className="error-message">{khoaError}</span>
                          )}
                        </div>

                        {/* ✅ Group 2 input time - căn giữa */}
                        <div className="khoa-time-group">
                          {/* Thời gian bắt đầu */}
                          <div className="form__group form__group__ctt khoa-time-wrapper">
                            <input
                              type="datetime-local"
                              className="form__input"
                              style={{
                                borderColor: startError ? "#bf2e29" : undefined,
                              }}
                              value={config.start}
                              onChange={(e) =>
                                updateKhoaConfig(
                                  config.id,
                                  "start",
                                  e.target.value
                                )
                              }
                              onBlur={() => validateAllKhoaConfigs()} // ✅ Validate khi blur
                              min={minMax.min}
                              max={minMax.max}
                              required
                            />
                            <label className="form__floating-label">
                              Bắt đầu
                            </label>
                            {startError && (
                              <span className="error-message">
                                * {startError}
                              </span>
                            )}
                          </div>

                          {/* Thời gian kết thúc */}
                          <div className="form__group form__group__ctt khoa-time-wrapper">
                            <input
                              type="datetime-local"
                              className="form__input"
                              style={{
                                borderColor: endError ? "#bf2e29" : undefined,
                              }}
                              value={config.end}
                              onChange={(e) =>
                                updateKhoaConfig(
                                  config.id,
                                  "end",
                                  e.target.value
                                )
                              }
                              onBlur={() => validateAllKhoaConfigs()} // ✅ Validate khi blur
                              min={minMaxEnd.min}
                              max={minMaxEnd.max}
                              required
                            />
                            <label className="form__floating-label">
                              Kết thúc
                            </label>
                            {endError && (
                              <span className="error-message">
                                * {endError}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nút xóa */}
                        <button
                          type="button"
                          onClick={() => removeKhoaConfig(config.id)}
                          className="btn-remove-config"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {/* Nút thêm config */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("✅ Add button clicked!");
                      addKhoaConfig();
                    }}
                    className="btn-add-config"
                    disabled={availableKhoa.length === 0}
                  >
                    <span style={{ fontSize: "16px" }}>+</span>
                    <span>Thêm mốc thời gian cho khoa</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Nút submit */}
        <button
          type="submit"
          className="form__button btn__chung"
          style={{ marginTop: "20px" }}
          disabled={!semesterStart || !semesterEnd || submitting}
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
