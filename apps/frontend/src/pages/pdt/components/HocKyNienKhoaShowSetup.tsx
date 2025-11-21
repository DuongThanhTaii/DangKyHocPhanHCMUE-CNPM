import type { FormEvent } from "react";
import type { HocKyNienKhoaDTO } from "../../../features/common/types";

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

export function HocKyNienKhoaShowSetup({
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
}: HocKyNienKhoaShowSetupProps) {
  console.log("🔍 [HocKyNienKhoaShowSetup] Render with:", {
    selectedNienKhoa,
    selectedHocKy,
    hocKyNienKhoasLength: hocKyNienKhoas.length,
  });

  const selectedNienKhoaObj = hocKyNienKhoas.find(
    (nk) => nk.nienKhoaId === selectedNienKhoa
  );

  console.log(
    "🔍 [HocKyNienKhoaShowSetup] selectedNienKhoaObj:",
    selectedNienKhoaObj
  );

  return (
    <form className="search-form" onSubmit={onSubmit}>
      {/* Niên khóa dropdown */}
      <div className="form__group">
        <label className="form__label">Niên khóa</label>
        <select
          className="form__select"
          value={selectedNienKhoa}
          onChange={(e) => {
            console.log("🔍 [Select] Niên khóa changed to:", e.target.value);
            onChangeNienKhoa(e.target.value);
          }}
          disabled={loadingHocKy || submitting}
        >
          <option value="">-- Chọn niên khóa --</option>
          {hocKyNienKhoas.map((nk) => (
            <option key={nk.nienKhoaId} value={nk.nienKhoaId}>
              {nk.tenNienKhoa}
            </option>
          ))}
        </select>
      </div>

      {/* Học kỳ dropdown */}
      <div className="form__group">
        <label className="form__label">Học kỳ</label>
        <select
          className="form__select"
          value={selectedHocKy}
          onChange={(e) => {
            console.log("🔍 [Select] Học kỳ changed to:", e.target.value);
            onChangeHocKy(e.target.value);
          }}
          disabled={!selectedNienKhoa || loadingHocKy || submitting}
        >
          <option value="">-- Chọn học kỳ --</option>
          {selectedNienKhoaObj?.hocKy.map((hk) => (
            <option key={hk.id} value={hk.id}>
              {hk.tenHocKy}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Date fields - RESTORE */}
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

      {/* ✅ Submit button - RESTORE */}
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
              ko d
            </svg>
            Set
          </>
        )}
      </button>

      {/* Message */}
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
    </form>
  );
}
