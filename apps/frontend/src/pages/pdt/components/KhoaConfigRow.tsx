import type { KhoaDTO } from "../../../features/pdt/types/pdtTypes";
import type { KhoaPhaseConfig } from "./KhoaConfigSection";

type KhoaConfigRowProps = {
  config: KhoaPhaseConfig;
  danhSachKhoa: KhoaDTO[];
  availableKhoa: KhoaDTO[];
  timeConstraints: {
    start: { min: string; max: string };
    end: { min: string; max: string };
  };
  errors: {
    start?: string;
    end?: string;
    khoa?: string;
  };
  onUpdateConfig: (
    configId: string,
    field: keyof KhoaPhaseConfig,
    value: any
  ) => void;
  onToggleKhoa: (configId: string, khoaId: string) => void;
  onRemove: (configId: string) => void;
  onValidate: () => void;
};

export const KhoaConfigRow = ({
  config,
  danhSachKhoa,
  availableKhoa,
  timeConstraints,
  errors,
  onUpdateConfig,
  onToggleKhoa,
  onRemove,
  onValidate,
}: KhoaConfigRowProps) => {
  return (
    <div className="khoa-config-row">
      {/* Dropdown chọn khoa */}
      <div className="khoa-select-container">
        <label className="khoa-select-label">Chọn khoa:</label>
        <div
          className="khoa-select-box"
          style={{
            borderColor: errors.khoa ? "#bf2e29" : "#d0d0d0",
          }}
        >
          {availableKhoa.map((khoa) => (
            <label key={khoa.id} className="khoa-select-item">
              <input
                type="checkbox"
                checked={config.khoaIds.includes(khoa.id)}
                onChange={() => onToggleKhoa(config.id, khoa.id)}
              />
              {khoa.tenKhoa}
            </label>
          ))}
          {/* ✅ Add type annotation for khoaId */}
          {config.khoaIds.map((khoaId: string) => {
            const khoa = danhSachKhoa.find((k) => k.id === khoaId);
            if (!khoa) return null;
            return (
              <label
                key={khoaId}
                className="khoa-select-item khoa-select-item--selected"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => onToggleKhoa(config.id, khoaId)}
                />
                {khoa.tenKhoa} ✓
              </label>
            );
          })}
        </div>
        {errors.khoa && <span className="error-message">{errors.khoa}</span>}
      </div>

      {/* Group 2 input time */}
      <div className="khoa-time-group">
        {/* Thời gian bắt đầu */}
        <div className="form__group form__group__ctt khoa-time-wrapper">
          <input
            type="datetime-local"
            className="form__input"
            style={{
              borderColor: errors.start ? "#bf2e29" : undefined,
            }}
            value={config.start}
            onChange={(e) => onUpdateConfig(config.id, "start", e.target.value)}
            onBlur={onValidate}
            min={timeConstraints.start.min}
            max={timeConstraints.start.max}
            required
          />
          <label className="form__floating-label">Bắt đầu</label>
          {errors.start && (
            <span className="error-message">* {errors.start}</span>
          )}
        </div>

        {/* Thời gian kết thúc */}
        <div className="form__group form__group__ctt khoa-time-wrapper">
          <input
            type="datetime-local"
            className="form__input"
            style={{
              borderColor: errors.end ? "#bf2e29" : undefined,
            }}
            value={config.end}
            onChange={(e) => onUpdateConfig(config.id, "end", e.target.value)}
            onBlur={onValidate}
            min={timeConstraints.end.min}
            max={timeConstraints.end.max}
            required
          />
          <label className="form__floating-label">Kết thúc</label>
          {errors.end && <span className="error-message">* {errors.end}</span>}
        </div>
      </div>

      {/* Nút xóa */}
      <button
        type="button"
        onClick={() => onRemove(config.id)}
        className="btn-remove-config"
      >
        ✕
      </button>
    </div>
  );
};
