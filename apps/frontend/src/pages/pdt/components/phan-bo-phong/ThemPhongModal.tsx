import { useState } from "react";
import type { PhongHocDTO } from "../../../../features/pdt/types/pdtTypes";

interface Props {
  availablePhong: PhongHocDTO[];
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (phongIds: string[]) => void;
}

export default function ThemPhongModal({
  availablePhong,
  loading,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [selectedPhongIds, setSelectedPhongIds] = useState<Set<string>>(
    new Set()
  );

  const handleTogglePhong = (phongId: string) => {
    const newSet = new Set(selectedPhongIds);
    if (newSet.has(phongId)) {
      newSet.delete(phongId);
    } else {
      newSet.add(phongId);
    }
    setSelectedPhongIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedPhongIds.size === availablePhong.length) {
      setSelectedPhongIds(new Set());
    } else {
      setSelectedPhongIds(new Set(availablePhong.map((p) => p.id)));
    }
  };

  const handleSubmit = () => {
    if (selectedPhongIds.size === 0) return;
    onSubmit(Array.from(selectedPhongIds));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm Phòng Học</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <p>Đang tải danh sách phòng...</p>
            </div>
          ) : availablePhong.length === 0 ? (
            <div className="modal-empty">
              <p>Không có phòng học available</p>
            </div>
          ) : (
            <>
              <div className="modal-actions">
                <button className="btn-select-all" onClick={handleSelectAll}>
                  {selectedPhongIds.size === availablePhong.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
                <span className="selected-count">
                  Đã chọn: {selectedPhongIds.size}/{availablePhong.length}
                </span>
              </div>

              <div className="phong-list-modal">
                {availablePhong.map((phong) => (
                  <div
                    key={phong.id}
                    className={`phong-item-modal ${
                      selectedPhongIds.has(phong.id) ? "selected" : ""
                    }`}
                    onClick={() => handleTogglePhong(phong.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPhongIds.has(phong.id)}
                      onChange={() => handleTogglePhong(phong.id)}
                      className="phong-checkbox"
                    />
                    <div className="phong-item-content">
                      <div className="phong-item-header">
                        <span className="phong-ma-modal">{phong.maPhong}</span>
                        <span className="phong-suc-chua-badge">
                          {phong.sucChua} SV
                        </span>
                      </div>
                      <div className="phong-co-so">{phong.tenCoSo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting || selectedPhongIds.size === 0}
          >
            {submitting
              ? "Đang thêm..."
              : `Thêm ${selectedPhongIds.size} phòng`}
          </button>
        </div>
      </div>
    </div>
  );
}
