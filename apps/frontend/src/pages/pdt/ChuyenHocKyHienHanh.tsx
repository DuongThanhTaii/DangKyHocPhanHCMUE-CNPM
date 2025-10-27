import { useState, type FormEvent, useEffect } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import {
  useHocKyNienKhoa,
  useSetHocKyHienHanh,
  useGetHocKyHienHanh,
} from "../../features/pdt/hooks";
import { useModalContext } from "../../hook/ModalContext";

type CurrentSemester = {
  ten_hoc_ky?: string | null;
  ten_nien_khoa?: string | null;
  ngay_bat_dau?: string | null;
  ngay_ket_thuc?: string | null;
  trang_thai?: string | null;
};

// ✅ Helper function to format date string
const formatDateString = (
  dateStr: string | null | undefined
): string | null => {
  if (!dateStr) return null;

  try {
    // ✅ Remove instanceof check - dateStr is always string | null | undefined
    const date = new Date(dateStr);

    // Check if date is valid
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString("vi-VN");
  } catch {
    return null;
  }
};

export default function ChuyenHocKyHienHanh() {
  const { openNotify } = useModalContext();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();
  const { setHocKyHienHanh, loading: submitting } = useSetHocKyHienHanh();
  const {
    data: hocKyHienHanh,
    loading: loadingCurrent,
    refetch, // ✅ Now available
  } = useGetHocKyHienHanh();

  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester>({});
  const [selectedKhoa, setSelectedKhoa] = useState<string>("all");

  // TODO: Fetch phase time từ API
  const [phaseTimeData, setPhaseTimeData] = useState({
    ghiDanh: {
      phaseType: "ghi_danh" as const,
      ngayBatDau: "2025-01-15T00:00:00.000Z",
      ngayKetThuc: "2025-02-28T23:59:59.999Z",
      trangThai: "active" as const,
    },
    dangKy: {
      phaseType: "dang_ky" as const,
      ngayBatDau: "2025-03-01T00:00:00.000Z",
      ngayKetThuc: "2025-03-15T23:59:59.999Z",
      trangThai: "upcoming" as const,
    },
  });

  useEffect(() => {
    if (hocKyHienHanh && hocKyNienKhoas.length > 0) {
      const foundNienKhoa = hocKyNienKhoas.find((nk) =>
        nk.hocKy.some((hk) => hk.id === hocKyHienHanh.id)
      );

      setCurrentSemester({
        ten_hoc_ky: hocKyHienHanh.tenHocKy,
        ten_nien_khoa: foundNienKhoa?.tenNienKhoa,
        ngay_bat_dau: formatDateString(hocKyHienHanh.ngayBatDau), // ✅ Use helper
        ngay_ket_thuc: formatDateString(hocKyHienHanh.ngayKetThuc), // ✅ Use helper
        trang_thai: "Đang hoạt động",
      });
    }
  }, [hocKyHienHanh, hocKyNienKhoas]);

  useEffect(() => {
    if (hocKyNienKhoas.length > 0 && !selectedNienKhoa) {
      const firstNienKhoa = hocKyNienKhoas[0];
      setSelectedNienKhoa(firstNienKhoa.id);

      if (firstNienKhoa.hocKy.length > 0) {
        setSelectedHocKy(firstNienKhoa.hocKy[0].id);
      }
    }
  }, [hocKyNienKhoas, selectedNienKhoa]);

  const handleChangeNienKhoa = (value: string) => {
    setSelectedNienKhoa(value);
    const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === value);
    if (nienKhoa?.hocKy.length) {
      setSelectedHocKy(nienKhoa.hocKy[0].id);
    } else {
      setSelectedHocKy("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedHocKy) return;

    const result = await setHocKyHienHanh({ hocKyId: selectedHocKy });

    if (result.isSuccess) {
      await refetch(); // ✅ Now works
    }
  };

  const handleUpdatePhaseTime = (
    phaseType: "ghi_danh" | "dang_ky",
    startDate: string,
    endDate: string
  ) => {
    // TODO: Call API to update phase time
    console.log("Update phase time:", { phaseType, startDate, endDate });

    openNotify({
      message: `API chỉnh thời gian ${
        phaseType === "ghi_danh" ? "Ghi Danh" : "Đăng Ký"
      } đang được phát triển`,
      type: "info",
    });
  };

  const matchedNienKhoa = hocKyNienKhoas.find(
    (nk) => nk.id === selectedNienKhoa
  );
  const hocKyOptions = matchedNienKhoa?.hocKy ?? [];

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">CHUYỂN HỌC KỲ HIỆN HÀNH</p>
      </div>

      <div className="body__inner">
        <div className="form-section">
          <h3 className="sub__title_chuyenphase">Thiết lập Học kỳ hiện hành</h3>

          <form className="search-form" onSubmit={handleSubmit}>
            {/* Niên khóa */}
            <div className="form__field">
              <label className="form__label" htmlFor="nien-khoa">
                Niên khóa
              </label>
              <select
                id="nien-khoa"
                className="form__select"
                value={selectedNienKhoa}
                onChange={(e) => handleChangeNienKhoa(e.target.value)}
                disabled={loadingHocKy}
              >
                <option value="">-- Chọn niên khóa --</option>
                {hocKyNienKhoas.map((nk) => (
                  <option key={nk.id} value={nk.id}>
                    {nk.tenNienKhoa}
                  </option>
                ))}
              </select>
            </div>

            {/* Học kỳ */}
            <div className="form__field">
              <label className="form__label" htmlFor="hoc-ky">
                Học kỳ
              </label>
              <select
                id="hoc-ky"
                className="form__select"
                value={selectedHocKy}
                onChange={(e) => setSelectedHocKy(e.target.value)}
                disabled={!selectedNienKhoa || hocKyOptions.length === 0}
              >
                <option value="">-- Chọn học kỳ --</option>
                {hocKyOptions.map((hk) => (
                  <option key={hk.id} value={hk.id}>
                    {hk.tenHocKy}
                  </option>
                ))}
              </select>
            </div>

            {/* Button Set */}
            <button
              type="submit"
              className="form__button btn__chung"
              disabled={submitting || !selectedHocKy}
            >
              {submitting ? "Đang xử lý..." : "Set"}
            </button>
          </form>
        </div>

        {/* Hiển thị học kỳ hiện tại */}
        {loadingCurrent ? (
          <div className="form-section" style={{ marginTop: "24px" }}>
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              Đang tải thông tin học kỳ hiện hành...
            </p>
          </div>
        ) : currentSemester.ten_hoc_ky ? (
          <div className="form-section" style={{ marginTop: "24px" }}>
            <h3 className="sub__title_chuyenphase">
              Học kỳ hiện tại - Trạng thái
            </h3>

            <div
              className="status-display"
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <div className="status-row" style={{ marginBottom: "12px" }}>
                <strong>Học kỳ:</strong>{" "}
                <span className="span__hk-nk">
                  {currentSemester.ten_hoc_ky} ({currentSemester.ten_nien_khoa})
                </span>
              </div>

              {(currentSemester.ngay_bat_dau ||
                currentSemester.ngay_ket_thuc) && (
                <div className="status-row" style={{ marginBottom: "12px" }}>
                  <strong>Thời gian:</strong>{" "}
                  {currentSemester.ngay_bat_dau && currentSemester.ngay_ket_thuc
                    ? `${currentSemester.ngay_bat_dau} → ${currentSemester.ngay_ket_thuc}`
                    : "Chưa thiết lập"}
                </div>
              )}

              <div className="status-row">
                <strong>Trạng thái:</strong>{" "}
                <span
                  style={{
                    color: "#16a34a",
                    fontWeight: 600,
                    padding: "4px 12px",
                    backgroundColor: "#dcfce7",
                    borderRadius: "4px",
                  }}
                >
                  {currentSemester.trang_thai}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
