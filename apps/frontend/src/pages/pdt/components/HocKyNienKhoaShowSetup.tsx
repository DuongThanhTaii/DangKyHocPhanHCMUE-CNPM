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
        Thiết lập Niên khóa &amp; Học kỳ hiện tại
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

        {/* <button
          type="submit"
          className="form__button btn__chung"
          disabled={submitting}
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
              Set
            </>
          )}
        </button> */}
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
