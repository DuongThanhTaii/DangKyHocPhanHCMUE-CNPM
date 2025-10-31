import { useMemo, useState } from "react";
import type { PhongHocDTO } from "../../../../features/pdt/types/pdtTypes";
import "../../../../styles/menu.css";

interface Props {
  availablePhong: PhongHocDTO[];
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (phongIds: string[]) => void;
}

/** Suy ra "dãy" (day) từ object phòng:
 * - Ưu tiên phong.day / phong.dayName nếu backend đã có.
 * - Nếu không, parse từ maPhong theo các pattern thường gặp: A101, A1-101, B-204, D1.203, I.203, C2_105, ...
 */
function inferDay(phong: any): string {
  if (phong?.day) return String(phong.day);
  if (phong?.dayName) return String(phong.dayName);
  const ma = String(phong?.maPhong || "").trim();

  // Ví dụ: D1-203, A2.105, C3_101 -> lấy block chữ+ số đứng đầu
  let m = ma.match(/^([A-Za-z]+[0-9]+)[\.\-_ ]?[0-9]+/);
  if (m) return m[1].toUpperCase();

  // Ví dụ: A101, B204, C-105, D.201 -> lấy chữ cái đầu
  m = ma.match(/^([A-Za-z])[\.\-_ ]?[0-9]+/);
  if (m) return m[1].toUpperCase();

  return "Khác";
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
  const [dayFilter, setDayFilter] = useState<string>("ALL"); // "ALL" | <day>

  // Danh sách dãy duy nhất (sort để dễ nhìn)
  const uniqueDays = useMemo(() => {
    const set = new Set<string>();
    for (const p of availablePhong) set.add(inferDay(p));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [availablePhong]);

  // Lọc theo dãy đang chọn
  const filteredPhong = useMemo(() => {
    if (dayFilter === "ALL") return availablePhong;
    return availablePhong.filter((p) => inferDay(p) === dayFilter);
  }, [availablePhong, dayFilter]);

  const handleTogglePhong = (phongId: string) => {
    const newSet = new Set(selectedPhongIds);
    if (newSet.has(phongId)) newSet.delete(phongId);
    else newSet.add(phongId);
    setSelectedPhongIds(newSet);
  };

  // Chọn tất cả theo danh sách ĐANG HIỂN THỊ
  const handleSelectAll = () => {
    const visibleIds = filteredPhong.map((p) => p.id);
    const allVisibleSelected = visibleIds.every((id) =>
      selectedPhongIds.has(id)
    );
    if (allVisibleSelected) {
      // Bỏ chọn các phòng đang hiển thị
      const newSet = new Set(selectedPhongIds);
      visibleIds.forEach((id) => newSet.delete(id));
      setSelectedPhongIds(newSet);
    } else {
      // Chọn thêm tất cả phòng đang hiển thị (giữ nguyên các phòng đã chọn ở dãy khác)
      const newSet = new Set(selectedPhongIds);
      visibleIds.forEach((id) => newSet.add(id));
      setSelectedPhongIds(newSet);
    }
  };

  const handleSubmit = () => {
    if (selectedPhongIds.size === 0) return;
    onSubmit(Array.from(selectedPhongIds));
  };

  const selectedCountInFiltered = useMemo(
    () => filteredPhong.filter((p) => selectedPhongIds.has(p.id)).length,
    [filteredPhong, selectedPhongIds]
  );

  const allVisibleSelected =
    filteredPhong.length > 0 &&
    filteredPhong.every((p) => selectedPhongIds.has(p.id));

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
              {/* Hàng hành động: Lọc dãy đặt cạnh nút Chọn tất cả */}
              <div
                className="modal-actions actions-with-filter"
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {/* Bộ lọc dãy */}
                <div
                  className="inline-filter"
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <label htmlFor="dayFilter" style={{ whiteSpace: "nowrap" }}>
                    Lọc dãy:
                  </label>
                  <select
                    id="dayFilter"
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    className="select-day"
                    style={{ minWidth: 140 }}
                  >
                    <option value="ALL">Tất cả dãy</option>
                    {uniqueDays.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Spacer để đẩy nút sang phải (có thể bỏ nếu không cần) */}
                <div style={{ flex: 1 }} />

                <button className="btn-select-all" onClick={handleSelectAll}>
                  {allVisibleSelected ? "Bỏ chọn" : "Chọn tất cả"}
                </button>

                <span
                  className="selected-count"
                  style={{ fontSize: 12, opacity: 0.85 }}
                >
                  Đã chọn (dãy): {selectedCountInFiltered}/
                  {filteredPhong.length}
                  &nbsp;|&nbsp; Tổng đã chọn: {selectedPhongIds.size}
                  &nbsp;|&nbsp; Hiển thị: {filteredPhong.length}/
                  {availablePhong.length}
                </span>
              </div>

              <div className="phong-list-modal">
                {filteredPhong.map((phong) => {
                  const day = inferDay(phong);
                  const checked = selectedPhongIds.has(phong.id);
                  return (
                    <div
                      key={phong.id}
                      className={`phong-item-modal ${
                        checked ? "selected" : ""
                      }`}
                      onClick={() => handleTogglePhong(phong.id)}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTogglePhong(phong.id)}
                        className="phong-checkbox"
                        onClick={(e) => e.stopPropagation()} // tránh toggle 2 lần
                      />
                      <div className="phong-item-content">
                        <div className="phong-item-header">
                          <span className="phong-ma-modal">
                            {phong.maPhong}
                          </span>
                          <span className="phong-suc-chua-badge">
                            {phong.sucChua} SV
                          </span>
                        </div>
                        <div
                          className="phong-subline"
                          style={{
                            display: "flex",
                            gap: 8,
                            fontSize: 12,
                            opacity: 0.85,
                          }}
                        >
                          <span className="phong-co-so">{phong.tenCoSo}</span>
                          <span>•</span>
                          <span className="phong-day">Dãy: {day}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
