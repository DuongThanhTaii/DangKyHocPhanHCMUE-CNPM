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
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path
                    fill="#ffffff"
                    d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm32 96c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                  />
                </svg>
                Lưu và xem
              </>
            ) : (
              <>
                {/* Icon Bút chì (Edit) */}
                <svg /* ...thêm các thuộc tính SVG ở trên vào đây... */>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
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
