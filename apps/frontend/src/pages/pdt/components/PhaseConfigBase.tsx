import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  type ChangeEvent,
} from "react";
import type { KhoaDTO } from "../../../features/pdt/types/pdtTypes";
import "./KhoaConfigSection.css";

export interface KhoaConfig {
  khoaId: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
}

export interface PhaseConfigRef {
  validate: () => boolean;
  getData: () => {
    isToanTruong: boolean;
    dotTheoKhoa: KhoaConfig[];
  };
}

export interface ExistingDotConfig {
  id: string;
  khoaId?: string | null; // ✅ Allow null
  tenKhoa?: string | null; // ✅ Allow null
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  isCheckToanTruong: boolean;
}

interface PhaseConfigBaseProps {
  title: string;
  danhSachKhoa: KhoaDTO[];
  phaseStartTime: string;
  phaseEndTime: string;
  existingData?: ExistingDotConfig[];
  onSubmit?: (data: any) => Promise<void>; // ✅ Add submit callback
}

export const PhaseConfigBase = forwardRef<PhaseConfigRef, PhaseConfigBaseProps>(
  (
    {
      title,
      danhSachKhoa,
      phaseStartTime,
      phaseEndTime,
      existingData = [],
      onSubmit,
    },
    ref
  ) => {
    const [isToanTruong, setIsToanTruong] = useState(true);
    const [khoaConfigs, setKhoaConfigs] = useState<KhoaConfig[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [savedKhoaConfigs, setSavedKhoaConfigs] = useState<KhoaConfig[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // ✅ Load existing data
    useEffect(() => {
      if (existingData.length === 0) {
        setIsEditMode(true);
        setIsToanTruong(true);
        setKhoaConfigs([]);
        setSavedKhoaConfigs([]);
        return;
      }

      const hasToanTruong = existingData.some((dot) => dot.isCheckToanTruong);
      setIsToanTruong(hasToanTruong);
      setIsEditMode(false);

      if (!hasToanTruong) {
        const configs = existingData
          .filter((dot) => !dot.isCheckToanTruong && dot.khoaId)
          .map((dot) => ({
            khoaId: dot.khoaId!,
            thoiGianBatDau: new Date(dot.thoiGianBatDau)
              .toISOString()
              .slice(0, 16),
            thoiGianKetThuc: new Date(dot.thoiGianKetThuc)
              .toISOString()
              .slice(0, 16),
          }));

        setKhoaConfigs(configs);
        setSavedKhoaConfigs(configs);
      }
    }, [existingData]);

    const handleToggleMode = async () => {
      if (isEditMode) {
        if (!validate()) return;

        // ✅ Call submit when saving
        if (onSubmit) {
          setSubmitting(true);
          try {
            const data = {
              isToanTruong,
              dotTheoKhoa: isToanTruong ? [] : khoaConfigs,
            };
            await onSubmit(data);
          } finally {
            setSubmitting(false);
          }
        }
      }
      setIsEditMode(!isEditMode);
    };

    const handleAddKhoaConfig = () => {
      setKhoaConfigs([
        ...khoaConfigs,
        {
          khoaId: "",
          thoiGianBatDau: phaseStartTime || "",
          thoiGianKetThuc: phaseEndTime || "",
        },
      ]);
    };

    const handleRemoveKhoaConfig = (index: number) => {
      setKhoaConfigs(khoaConfigs.filter((_, i) => i !== index));
    };

    const handleKhoaConfigChange = (
      index: number,
      field: keyof KhoaConfig,
      value: string
    ) => {
      const newConfigs = [...khoaConfigs];
      newConfigs[index][field] = value;
      setKhoaConfigs(newConfigs);
    };

    const handleToggleToanTruong = (checked: boolean) => {
      if (checked) {
        if (khoaConfigs.length > 0) setSavedKhoaConfigs([...khoaConfigs]);
        setKhoaConfigs([]);
      } else {
        if (savedKhoaConfigs.length > 0) {
          setKhoaConfigs([...savedKhoaConfigs]);
        } else {
          setKhoaConfigs([
            {
              khoaId: "",
              thoiGianBatDau: phaseStartTime || "",
              thoiGianKetThuc: phaseEndTime || "",
            },
          ]);
        }
      }

      setIsToanTruong(checked);
      setValidationErrors([]);
    };

    const validate = (): boolean => {
      const errors: string[] = [];

      if (!isToanTruong) {
        if (khoaConfigs.length === 0) {
          errors.push("Vui lòng thêm ít nhất 1 cấu hình khoa");
        }

        khoaConfigs.forEach((config, index) => {
          if (!config.khoaId) {
            errors.push(`Cấu hình ${index + 1}: Chưa chọn khoa`);
          }
          if (!config.thoiGianBatDau || !config.thoiGianKetThuc) {
            errors.push(`Cấu hình ${index + 1}: Chưa nhập đủ thời gian`);
          }

          if (config.thoiGianBatDau && config.thoiGianKetThuc) {
            if (
              new Date(config.thoiGianBatDau) >=
              new Date(config.thoiGianKetThuc)
            ) {
              errors.push(
                `Cấu hình ${index + 1}: Thời gian bắt đầu phải trước kết thúc`
              );
            }
          }
        });

        const khoaIds = khoaConfigs.map((c) => c.khoaId).filter((id) => id);
        if (khoaIds.length !== new Set(khoaIds).size) {
          errors.push("Không được chọn trùng khoa");
        }
      }

      setValidationErrors(errors);
      return errors.length === 0;
    };

    useImperativeHandle(ref, () => ({
      validate,
      getData: () => ({
        isToanTruong,
        dotTheoKhoa: isToanTruong ? [] : khoaConfigs,
      }),
    }));

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const renderViewMode = () => {
      if (isToanTruong) {
        const toanTruongDot = existingData.find((dot) => dot.isCheckToanTruong);

        return (
          <div className="khoa-config-view">
            <div className="khoa-config-view__title">
              📋 Cấu hình hiện tại: Toàn trường
            </div>
            {toanTruongDot ? (
              <div className="khoa-config-view__toan-truong">
                <div>
                  <strong>Bắt đầu:</strong>{" "}
                  {formatDateTime(toanTruongDot.thoiGianBatDau)}
                </div>
                <div>
                  <strong>Kết thúc:</strong>{" "}
                  {formatDateTime(toanTruongDot.thoiGianKetThuc)}
                </div>
              </div>
            ) : (
              <div className="khoa-config-view__empty">Chưa có cấu hình</div>
            )}
          </div>
        );
      } else {
        const khoaDots = existingData.filter((dot) => !dot.isCheckToanTruong);

        return (
          <div className="khoa-config-view">
            <div className="khoa-config-view__title">
              📋 Cấu hình hiện tại: Riêng từng khoa
            </div>
            {khoaDots.length > 0 ? (
              <div className="khoa-config-view__list">
                {khoaDots.map((dot, idx) => (
                  <div key={dot.id} className="khoa-config-view__item">
                    <div className="khoa-config-view__item-name">
                      {idx + 1}. {dot.tenKhoa || "N/A"}
                    </div>
                    <div className="khoa-config-view__item-details">
                      <div>
                        <strong>Bắt đầu:</strong>{" "}
                        {formatDateTime(dot.thoiGianBatDau)}
                      </div>
                      <div>
                        <strong>Kết thúc:</strong>{" "}
                        {formatDateTime(dot.thoiGianKetThuc)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="khoa-config-view__empty">Chưa có cấu hình</div>
            )}
          </div>
        );
      }
    };

    return (
      <div className="khoa-config-section">
        <div className="khoa-config-header">
          <h4 className="khoa-config-title">{title}</h4>
          <button
            type="button"
            onClick={handleToggleMode}
            className={`khoa-config-toggle-btn ${
              isEditMode
                ? "khoa-config-toggle-btn--edit"
                : "khoa-config-toggle-btn--view"
            }`}
            disabled={submitting}
          >
            {submitting ? (
              "Đang lưu..." // Bạn cũng có thể thêm icon loading ở đây
            ) : isEditMode ? (
              <>Lưu và xem</>
            ) : (
              <>
              
                Chỉnh sửa
              </>
            )}
          </button>
        </div>

        {!isEditMode && renderViewMode()}

        {isEditMode && (
          <>
            <div className="khoa-config-edit__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={isToanTruong}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleToggleToanTruong(e.target.checked)
                  }
                />
                <span>Áp dụng cho toàn trường</span>
              </label>
            </div>

            {!isToanTruong && (
              <div>
                <div className="khoa-config-list">
                  {khoaConfigs.map((config, index) => (
                    <div key={index} className="khoa-config-item">
                      <div className="khoa-config-item__header">
                        <span>Cấu hình {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKhoaConfig(index)}
                          className="khoa-config-item__remove-btn"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="khoa-config-item__fields">
                        <div className="khoa-config-field">
                          <label>Khoa:</label>
                          <select
                            value={config.khoaId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleKhoaConfigChange(
                                index,
                                "khoaId",
                                e.target.value
                              )
                            }
                            className="khoa-config-field__select"
                          >
                            <option value="">-- Chọn khoa --</option>
                            {danhSachKhoa.map((khoa) => (
                              <option key={khoa.id} value={khoa.id}>
                                {khoa.tenKhoa}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="khoa-config-field">
                          <label>Thời gian bắt đầu:</label>
                          <input
                            type="datetime-local"
                            value={config.thoiGianBatDau}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleKhoaConfigChange(
                                index,
                                "thoiGianBatDau",
                                e.target.value
                              )
                            }
                            className="khoa-config-field__input"
                          />
                        </div>

                        <div className="khoa-config-field">
                          <label>Thời gian kết thúc:</label>
                          <input
                            type="datetime-local"
                            value={config.thoiGianKetThuc}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleKhoaConfigChange(
                                index,
                                "thoiGianKetThuc",
                                e.target.value
                              )
                            }
                            className="khoa-config-field__input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddKhoaConfig}
                  className="khoa-config-add-btn"
                >
                  + Thêm cấu hình cho khoa
                </button>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="khoa-config-errors">
                <div className="khoa-config-errors__title">❌ Lỗi:</div>
                <ul className="khoa-config-errors__list">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

PhaseConfigBase.displayName = "PhaseConfigBase";
