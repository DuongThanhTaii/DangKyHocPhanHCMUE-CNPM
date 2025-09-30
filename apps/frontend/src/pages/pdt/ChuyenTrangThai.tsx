import { useEffect, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";

type HienHanh = {
  phase?: string;
  ten_hoc_ky?: string;
  ten_nien_khoa?: string;
  ngay_bat_dau?: string | null;
  ngay_ket_thuc?: string | null;
};

type NienKhoa = { id: string; ten_nien_khoa: string };
type HocKy = { id: string; ten_hoc_ky: string; ma_hoc_ky: string };

const PHASE_NAMES: Record<string, string> = {
  de_xuat_phe_duyet: "Tiền ghi danh",
  ghi_danh: "Ghi danh học phần",
  sap_xep_tkb: "Sắp xếp thời khóa biểu",
  dang_ky_hoc_phan: "Đăng ký học phần",
  binh_thuong: "Bình thường",
};

const PHASE_ORDER: string[] = [
  "de_xuat_phe_duyet",
  "ghi_danh",
  "sap_xep_tkb",
  "dang_ky_hoc_phan",
  "binh_thuong",
];

export default function ChuyenTrangThai() {
  // ====== Học kỳ / Niên khóa ======
  const [nienKhoas, setNienKhoas] = useState<NienKhoa[]>([]);
  const [hocKys, setHocKys] = useState<HocKy[]>([]);
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");

  const [semesterStart, setSemesterStart] = useState<string>("");
  const [semesterEnd, setSemesterEnd] = useState<string>("");

  const [currentSemester, setCurrentSemester] = useState<HienHanh>({});
  const [semesterMessage, setSemesterMessage] = useState<string>("");

  // ====== Phase / trạng thái ======
  type PhaseTime = { start: string; end: string };
  const [phaseTimes, setPhaseTimes] = useState<Record<string, PhaseTime>>({
    de_xuat_phe_duyet: { start: "", end: "" },
    ghi_danh: { start: "", end: "" },
    sap_xep_tkb: { start: "", end: "" },
    dang_ky_hoc_phan: { start: "", end: "" },
    binh_thuong: { start: "", end: "" },
  });

  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // ====== Load dữ liệu ban đầu ======
  useEffect(() => {
    (async () => {
      try {
        // 1) Học kỳ hiện hành
        const hh = await fetchJSON("/api/hien-hanh");
        if (hh?.data) {
          setCurrentSemester(hh.data);
          if (hh.data.phase) setCurrentPhase(hh.data.phase);
        }

        // 2) Danh sách niên khóa
        const nk = await fetchJSON("/api/pdt/nien-khoa");
        setNienKhoas(nk?.data ?? []);

        // 3) Nếu có niên khóa hiện hành => load học kỳ của nó
        if (nk?.data?.length) {
          // nếu backend trả trong hh có id_nien_khoa, dùng nó, không thì dùng cái đầu tiên
          const nkIdFromCurrent = hh?.data?.id_nien_khoa ?? nk.data[0]?.id;
          setSelectedNienKhoa(nkIdFromCurrent);
          const hkByNk = await fetchJSON(
            `/api/pdt/hoc-ky?nien_khoa_id=${nkIdFromCurrent}`
          );
          setHocKys(hkByNk?.data ?? []);

          if (hh?.data?.id_hoc_ky) {
            setSelectedHocKy(hh.data.id_hoc_ky);
            // set ngày nếu có
            if (hh.data.ngay_bat_dau)
              setSemesterStart(hh.data.ngay_bat_dau.slice(0, 10));
            if (hh.data.ngay_ket_thuc)
              setSemesterEnd(hh.data.ngay_ket_thuc.slice(0, 10));
          } else if (hkByNk?.data?.length) {
            setSelectedHocKy(hkByNk.data[0].id);
          }
        }

        // 4) Phase đang cấu hình (nếu backend có API)
        const phases = await fetchJSON("/api/pdt/ky-phase");
        if (Array.isArray(phases?.data)) {
          const next = { ...phaseTimes };
          for (const p of phases.data) {
            if (next[p.phase]) {
              next[p.phase] = {
                start: toLocalDatetime(p.start_at),
                end: toLocalDatetime(p.end_at),
              };
            }
          }
          setPhaseTimes(next);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đổi niên khóa -> load học kỳ
  useEffect(() => {
    if (!selectedNienKhoa) return;
    (async () => {
      try {
        const hkByNk = await fetchJSON(
          `/api/pdt/hoc-ky?nien_khoa_id=${selectedNienKhoa}`
        );
        setHocKys(hkByNk?.data ?? []);
        // tự chọn học kỳ đầu (nếu chưa chọn)
        if (hkByNk?.data?.length && !selectedHocKy) {
          setSelectedHocKy(hkByNk.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNienKhoa]);

  // ====== Handlers: Học kỳ/Niên khóa ======
  const handleSubmitSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSemesterMessage("");

    if (!selectedNienKhoa || !selectedHocKy) {
      setSemesterMessage("❌ Vui lòng chọn đầy đủ Niên khóa & Học kỳ");
      return;
    }
    if (!semesterStart || !semesterEnd) {
      setSemesterMessage("❌ Vui lòng nhập ngày bắt đầu/kết thúc");
      return;
    }

    try {
      const res = await fetchJSON("/api/pdt/set-hoc-ky-hien-tai", {
        method: "POST",
        body: {
          id_nien_khoa: selectedNienKhoa,
          id_hoc_ky: selectedHocKy,
          ngay_bat_dau: semesterStart,
          ngay_ket_thuc: semesterEnd,
        },
      });

      if (res?.success) {
        setSemesterMessage("✅ Thiết lập học kỳ hiện tại thành công");
        // cập nhật hiển thị
        const hk = hocKys.find((x) => x.id === selectedHocKy);
        const nk = nienKhoas.find((x) => x.id === selectedNienKhoa);
        setCurrentSemester({
          ten_hoc_ky: hk?.ten_hoc_ky,
          ten_nien_khoa: nk?.ten_nien_khoa,
          ngay_bat_dau: semesterStart,
          ngay_ket_thuc: semesterEnd,
        });
      } else {
        setSemesterMessage(res?.error || "❌ Không thể thiết lập học kỳ");
      }
    } catch (err) {
      setSemesterMessage("❌ Lỗi kết nối máy chủ");
    }
  };

  // ====== Handlers: Phases ======
  const handlePhaseTimeChange = (
    phase: string,
    field: "start" | "end",
    value: string
  ) => {
    setPhaseTimes((prev) => ({
      ...prev,
      [phase]: { ...prev[phase], [field]: value },
    }));
  };

  const handleSubmitPhases = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validate nhanh
    for (const key of PHASE_ORDER) {
      const t = phaseTimes[key];
      if (!t.start || !t.end) {
        setMessage("❌ Vui lòng nhập đầy đủ thời gian cho tất cả phase");
        return;
      }
      if (new Date(t.end) <= new Date(t.start)) {
        setMessage(`❌ Thời gian không hợp lệ ở phase: ${PHASE_NAMES[key]}`);
        return;
      }
    }

    const payload = PHASE_ORDER.map((phase) => ({
      phase,
      start_at: new Date(phaseTimes[phase].start).toISOString(),
      end_at: new Date(phaseTimes[phase].end).toISOString(),
      is_enabled: true,
    }));

    try {
      const res = await fetchJSON("/api/pdt/ky-phase/bulk-upsert", {
        method: "POST",
        body: { items: payload },
      });
      if (res?.success) {
        setMessage("✅ Cập nhật trạng thái hệ thống thành công");
      } else {
        setMessage(res?.error || "❌ Không thể cập nhật trạng thái");
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối máy chủ");
    }
  };

  // ====== Render ======
  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRẠNG THÁI HỆ THỐNG</p>
      </div>

      <div className="body__inner">
        {/* ====== KHỐI 1: Niên khóa & Học kỳ (đưa lên trên) ====== */}
        <div className="form-section">
          <h3 className="sub__title_chuyenphase">
            Thiết lập Niên khóa & Học kỳ hiện tại
          </h3>

          <form className="search-form" onSubmit={handleSubmitSemester}>
            <div className="form__group">
              <select
                className="form__select w__200"
                value={selectedNienKhoa}
                onChange={(e) => setSelectedNienKhoa(e.target.value)}
              >
                {nienKhoas.map((nk) => (
                  <option key={nk.id} value={nk.id}>
                    {nk.ten_nien_khoa}
                  </option>
                ))}
              </select>
              <label className="form__label">Niên khóa</label>
            </div>

            <div className="form__group">
              <select
                className="form__select w__200"
                value={selectedHocKy}
                onChange={(e) => setSelectedHocKy(e.target.value)}
              >
                {hocKys.map((hk) => (
                  <option key={hk.id} value={hk.id}>
                    {hk.ten_hoc_ky}
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
                onChange={(e) => setSemesterStart(e.target.value)}
                required
              />
              <label className="form__floating-label">Ngày bắt đầu</label>
            </div>

            <div className="form__group form__group__ctt">
              <input
                type="date"
                className="form__input"
                value={semesterEnd}
                onChange={(e) => setSemesterEnd(e.target.value)}
                required
              />
              <label className="form__floating-label">Ngày kết thúc</label>
            </div>

            <button type="submit" className="form__button btn__chung">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                <path
                  d="M15.8331 14.5H15.0431L14.7631 14.23C15.7431 13.09 16.3331 11.61 16.3331 10C16.3331 6.41 13.4231 3.5 9.83313 3.5C6.24313 3.5 3.33313 6.41 3.33313 10C3.33313 13.59 6.24313 16.5 9.83313 16.5C11.4431 16.5 12.9231 15.91 14.0631 14.93L14.3331 15.21V16L19.3331 20.99L20.8231 19.5L15.8331 14.5ZM9.83313 14.5C7.34313 14.5 5.33313 12.49 5.33313 10C5.33313 7.51 7.34313 5.5 9.83313 5.5C12.3231 5.5 14.3331 7.51 14.3331 10C14.3331 12.49 12.3231 14.5 9.83313 14.5Z"
                  fill="currentColor"
                />
              </svg>
              Set
            </button>
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

        {/* ====== KHỐI 2: Chuyển trạng thái (đưa xuống dưới, 5 phase + inputs) ====== */}
        <div className="form-section" style={{ marginTop: "2rem" }}>
          <h3 className="sub__title_chuyenphase">
            Thiết lập trạng thái hệ thống theo giai đoạn
          </h3>

          <form
            className="search-form phases-form"
            onSubmit={handleSubmitPhases}
          >
            {PHASE_ORDER.map((phaseKey) => (
              <div key={phaseKey} className="phase-row">
                <div className="form__group" style={{ marginBottom: 0 }}>
                  <div
                    className="form__select"
                    style={{ padding: "10px 12px" }}
                  >
                    <strong>{PHASE_NAMES[phaseKey]}</strong>
                    {currentPhase === phaseKey ? (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "var(--green, #1A9E55)",
                        }}
                      >
                        (đang mở)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div
                  className="form__group form__group__ctt"
                  style={{ marginBottom: 0 }}
                >
                  <input
                    type="datetime-local"
                    className="form__input"
                    value={phaseTimes[phaseKey].start}
                    onChange={(e) =>
                      handlePhaseTimeChange(phaseKey, "start", e.target.value)
                    }
                    required
                  />
                  <label className="form__floating-label">Bắt đầu</label>
                </div>

                <div
                  className="form__group form__group__ctt"
                  style={{ marginBottom: 0 }}
                >
                  <input
                    type="datetime-local"
                    className="form__input"
                    value={phaseTimes[phaseKey].end}
                    onChange={(e) =>
                      handlePhaseTimeChange(phaseKey, "end", e.target.value)
                    }
                    required
                  />
                  <label className="form__floating-label">Kết thúc</label>
                </div>
              </div>
            ))}

            {/* Nút chuyển đặt dưới cùng */}
            <button
              type="submit"
              className="form__button btn__chung"
              style={{ marginTop: "20px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                <path
                  d="M15.8331 14.5H15.0431L14.7631 14.23C15.7431 13.09 16.3331 11.61 16.3331 10C16.3331 6.41 13.4231 3.5 9.83313 3.5C6.24313 3.5 3.33313 6.41 3.33313 10C3.33313 13.59 6.24313 16.5 9.83313 16.5C11.4431 16.5 12.9231 15.91 14.0631 14.93L14.3331 15.21V16L19.3331 20.99L20.8231 19.5L15.8331 14.5ZM9.83313 14.5C7.34313 14.5 5.33313 12.49 5.33313 10C5.33313 7.51 7.34313 5.5 9.83313 5.5C12.3231 5.5 14.3331 7.51 14.3331 10C14.3331 12.49 12.3231 14.5 9.83313 14.5Z"
                  fill="currentColor"
                />
              </svg>
              Cập nhật trạng thái
            </button>
          </form>

          <p className="phase" style={{ marginTop: "10px" }}>
            Trạng thái hiện tại:{" "}
            <strong>{PHASE_NAMES[currentPhase] || "Không xác định"}</strong>
          </p>
          {message && (
            <p
              style={{
                color: message.includes("✅") ? "green" : "red",
                marginTop: 4,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* =============== helpers =============== */
function toLocalDatetime(iso: string | null | undefined) {
  if (!iso) return "";
  // ISO -> YYYY-MM-DDTHH:mm (input datetime-local)
  const d = new Date(iso);
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
