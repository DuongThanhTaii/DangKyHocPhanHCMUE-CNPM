import type { FormEvent } from "react";
import type { HocKyNienKhoaDTO } from "../../../features/pdt";

type CurrentSemester = {
  ten_hoc_ky?: string | null;
  ten_nien_khoa?: string | null;
  ngay_bat_dau?: string | null;
  ngay_ket_thuc?: string | null;
};

type HocKyNienKhoaShowSetupProps = {
  hocKyNienKhoas: HocKyNienKhoaDTO[];
  loadingHocKy: boolean;
  submitting: boolean;
  selectedNienKhoa: string;
  selectedHocKy: string;
  semesterStart: string;
  semesterEnd: string;
  currentSemester: CurrentSemester;
  semesterMessage: string;
  showDateFields?: boolean; // ✅ Add this
  showSetButton?: boolean; // ✅ Thêm prop này
  onChangeNienKhoa: (value: string) => void;
  onChangeHocKy: (value: string) => void;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const HocKyNienKhoaShowSetup = ({
  hocKyNienKhoas,
  loadingHocKy,
  submitting,
  selectedNienKhoa,
  selectedHocKy,
  semesterStart,
  semesterEnd,
  currentSemester,
  semesterMessage,
  showDateFields = true, // ✅ Default true for backward compatibility
  showSetButton = false, // ✅ Default là false
  onChangeNienKhoa,
  onChangeHocKy,
  onChangeStart,
  onChangeEnd,
  onSubmit,
}: HocKyNienKhoaShowSetupProps) => {
  const matchedNienKhoa = hocKyNienKhoas.find(
    (nk) => nk.id === selectedNienKhoa
  );
  const hocKyOptions = matchedNienKhoa?.hocKy ?? [];
  const disableHocKy =
    !selectedNienKhoa || loadingHocKy || hocKyOptions.length === 0;

  return (
    <div className="form-section">
      <h3 className="sub__title_chuyenphase">
        {showSetButton
          ? "Thiết lập Niên khóa & Học kỳ hiện tại"
          : "Chọn Niên khóa & Học kỳ"}
      </h3>

      <form className="search-form" onSubmit={onSubmit}>
        <div className="form__group">
          <select
            className="form__select w__200"
            style={{ backgroundColor: "white" }}
            value={selectedNienKhoa}
            onChange={(e) => onChangeNienKhoa(e.target.value)}
            disabled={loadingHocKy || hocKyNienKhoas.length === 0 || submitting}
          >
            {!selectedNienKhoa && <option value="">Chọn niên khóa</option>}
            {hocKyNienKhoas.map((nk) => (
              <option key={nk.id} value={nk.id}>
                {nk.tenNienKhoa}
              </option>
            ))}
          </select>
          <label className="form__label">Niên khóa</label>
        </div>

        <div className="form__group">
          <select
            className="form__select w__200"
            style={{ backgroundColor: "white" }}
            value={selectedHocKy}
            onChange={(e) => onChangeHocKy(e.target.value)}
            disabled={disableHocKy || submitting}
          >
            {(!selectedHocKy || disableHocKy) && (
              <option value="">Chọn học kỳ</option>
            )}
            {hocKyOptions.map((hk) => (
              <option key={hk.id} value={hk.id}>
                {hk.tenHocKy}
              </option>
            ))}
          </select>
          <label className="form__label">Học kỳ</label>
        </div>

        {/* ✅ Conditionally show date fields */}
        {showDateFields && (
          <>
            <div className="form__group form__group__ctt">
              <input
                type="date"
                className="form__input"
                value={semesterStart}
                onChange={(e) => onChangeStart(e.target.value)}
                disabled={submitting}
                required
              />
              <label className="form__floating-label">Ngày bắt đầu</label>
            </div>

            <div className="form__group form__group__ctt">
              <input
                type="date"
                className="form__input"
                value={semesterEnd}
                onChange={(e) => onChangeEnd(e.target.value)}
                disabled={submitting}
                required
              />
              <label className="form__floating-label">Ngày kết thúc</label>
            </div>
          </>
        )}

        {/* ✅ Hiện button Set nếu showSetButton = true */}
        {showSetButton && (
          <button
            type="submit"
            className="form__button btn__chung"
            disabled={submitting}
          >
            {submitting ? (
              "Đang xử lý..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    fill="currentColor"
                  />
                </svg>
                Set
              </>
            )}
          </button>
        )}
      </form>

      {currentSemester.ten_nien_khoa && (
        <p className="phase" style={{ marginTop: "8px" }}>
          Học kỳ hiện tại:{" "}
          <strong>
            <span className="span__hk-nk">
              {currentSemester.ten_hoc_ky} ({currentSemester.ten_nien_khoa})
            </span>
            <br />
            {currentSemester.ngay_bat_dau && currentSemester.ngay_ket_thuc
              ? `Từ ${currentSemester.ngay_bat_dau} đến ${currentSemester.ngay_ket_thuc}`
              : "Chưa có ngày bắt đầu và kết thúc"}
          </strong>
        </p>
      )}

      {semesterMessage && (
        <p
          style={{
            color: semesterMessage.includes("✅") ? "green" : "red",
            marginTop: 8,
          }}
        >
          {semesterMessage}
        </p>
      )}
    </div>
  );
};
