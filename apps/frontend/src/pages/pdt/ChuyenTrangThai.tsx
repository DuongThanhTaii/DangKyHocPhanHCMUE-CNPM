import { useEffect, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import {
  useHocKyNienKhoa,
  useSetHocKyHienTai,
  useCreateBulkKyPhase,
} from "../../features/pdt";
import { HocKyNienKhoaShowSetup } from "./components/HocKyNienKhoaShowSetup";
import { PhaseHocKyNienKhoaSetup } from "./components/PhaseHocKyNienKhoaSetup";

type HienHanh = {
  phase?: string | null;
  ten_hoc_ky?: string | null;
  ten_nien_khoa?: string | null;
  ngay_bat_dau?: string | null;
  ngay_ket_thuc?: string | null;
};

type NienKhoa = { id: string; ten_nien_khoa: string };
type HocKy = { id: string; ten_hoc_ky: string; ma_hoc_ky: string };

export const PHASE_NAMES: Record<string, string> = {
  de_xuat_phe_duyet: "Tiền ghi danh",
  ghi_danh: "Ghi danh học phần",
  sap_xep_tkb: "Sắp xếp thời khóa biểu",
  dang_ky_hoc_phan: "Đăng ký học phần",
  binh_thuong: "Bình thường",
};

export const PHASE_ORDER: string[] = [
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
  const { data: hocKyNienKhoas = [], loading: loadingHocKy } =
    useHocKyNienKhoa();
  const { setHocKyHienTai, loading: submittingHocKy } = useSetHocKyHienTai();
  const { createBulkKyPhase, loading: submittingPhases } =
    useCreateBulkKyPhase();

  useEffect(() => {
    if (!hocKyNienKhoas.length) {
      return;
    }

    if (!selectedNienKhoa) {
      setHocKys([]);
      if (selectedHocKy) setSelectedHocKy("");
      return;
    }

    const matchedNienKhoa = hocKyNienKhoas.find(
      (nk) => nk.id === selectedNienKhoa
    );

    const mappedHocKys =
      matchedNienKhoa?.hocKy.map((hk) => ({
        id: hk.id,
        ten_hoc_ky: hk.tenHocKy,
        ma_hoc_ky: hk.id,
      })) ?? [];

    setHocKys(mappedHocKys);

    if (!mappedHocKys.length) {
      if (selectedHocKy) setSelectedHocKy("");
      return;
    }

    if (!selectedHocKy || !mappedHocKys.some((hk) => hk.id === selectedHocKy)) {
      setSelectedHocKy(mappedHocKys[0].id);
    }
  }, [selectedNienKhoa, hocKyNienKhoas, selectedHocKy]);

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

  const [loading, setLoading] = useState<boolean>(true);

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
          const nkIdFromCurrent = hh?.data?.id_nien_khoa ?? nk.data[0]?.id;
          setSelectedNienKhoa(nkIdFromCurrent);

          if (hh?.data?.id_hoc_ky) {
            setSelectedHocKy(hh.data.id_hoc_ky);
            if (hh.data.ngay_bat_dau)
              setSemesterStart(hh.data.ngay_bat_dau.slice(0, 10));
            if (hh.data.ngay_ket_thuc)
              setSemesterEnd(hh.data.ngay_ket_thuc.slice(0, 10));
          } else {
            setSelectedHocKy("");
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
      } finally {
        setLoading(false);
      }
    })();
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

    // Validation
    if (!selectedNienKhoa || !selectedHocKy) {
      setSemesterMessage("❌ Vui lòng chọn đầy đủ niên khóa và học kỳ");
      return;
    }
    if (!semesterStart || !semesterEnd) {
      setSemesterMessage("❌ Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc");
      return;
    }

    // Gọi API với ServiceResult pattern
    const result = await setHocKyHienTai({
      id_nien_khoa: selectedNienKhoa,
      id_hoc_ky: selectedHocKy,
      ngay_bat_dau: semesterStart,
      ngay_ket_thuc: semesterEnd,
    });

    if (result.isSuccess) {
      // ✅ Thành công
      setSemesterMessage(`✅ ${result.message}`);

      const matchedNienKhoa = hocKyNienKhoas.find(
        (nkItem) => nkItem.id === selectedNienKhoa
      );
      const matchedHocKy = matchedNienKhoa?.hocKy.find(
        (hkItem) => hkItem.id === selectedHocKy
      );

      setCurrentSemester({
        ten_hoc_ky: matchedHocKy?.tenHocKy,
        ten_nien_khoa: matchedNienKhoa?.tenNienKhoa,
        ngay_bat_dau: semesterStart,
        ngay_ket_thuc: semesterEnd,
      });

      // Optional: Log phase data nếu BE trả về
      if (result.data) {
        console.log("Created KyPhase:", {
          id: result.data.id,
          phase: result.data.phase,
          startAt: result.data.startAt.toISOString(),
          endAt: result.data.endAt.toISOString(),
          isEnabled: result.data.isEnabled,
        });
      }
    } else {
      // ❌ Thất bại
      const errorMessage = result.errorCode
        ? `❌ ${result.message} (Mã lỗi: ${result.errorCode})`
        : `❌ ${result.message}`;
      setSemesterMessage(errorMessage);
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

    // Validate: phải chọn học kỳ
    if (!selectedHocKy) {
      setMessage("❌ Vui lòng chọn học kỳ trước");
      return;
    }

    // Validate: phải set học kỳ trước
    if (!semesterStart || !semesterEnd) {
      setMessage(
        "❌ Vui lòng thiết lập học kỳ (phần trên) trước khi cấu hình phase"
      );
      return;
    }

    const semesterStartTime = new Date(`${semesterStart}T00:00`).getTime();
    const semesterEndTime = new Date(`${semesterEnd}T23:59`).getTime();

    // Validate từng phase
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      const key = PHASE_ORDER[i];
      const t = phaseTimes[key];

      if (!t.start || !t.end) {
        setMessage(
          `❌ Vui lòng nhập đầy đủ thời gian cho phase: ${PHASE_NAMES[key]}`
        );
        return;
      }

      const startTime = new Date(t.start).getTime();
      const endTime = new Date(t.end).getTime();

      // Kiểm tra start < end
      if (endTime <= startTime) {
        setMessage(
          `❌ Thời gian không hợp lệ ở phase: ${PHASE_NAMES[key]} (kết thúc phải sau bắt đầu)`
        );
        return;
      }

      // Kiểm tra nằm trong khoảng học kỳ
      if (startTime < semesterStartTime || endTime > semesterEndTime) {
        setMessage(
          `❌ Phase "${PHASE_NAMES[key]}" phải nằm trong khoảng học kỳ (${semesterStart} - ${semesterEnd})`
        );
        return;
      }

      // Kiểm tra không trùng phase trước
      if (i > 0) {
        const prevKey = PHASE_ORDER[i - 1];
        const prevEnd = new Date(phaseTimes[prevKey].end).getTime();
        if (startTime < prevEnd) {
          setMessage(
            `❌ Phase "${PHASE_NAMES[key]}" không được bắt đầu trước khi phase "${PHASE_NAMES[prevKey]}" kết thúc`
          );
          return;
        }
      }
    }

    // Gọi API với custom hook
    const result = await createBulkKyPhase({
      hocKyId: selectedHocKy,
      phases: PHASE_ORDER.map((phase) => ({
        phase,
        startAt: new Date(phaseTimes[phase].start).toISOString(),
        endAt: new Date(phaseTimes[phase].end).toISOString(),
      })),
    });

    if (result.isSuccess) {
      setMessage(`✅ ${result.message}`);
      console.log(`Created ${result.data?.length} phases:`, result.data);
    } else {
      const errorMsg = result.errorCode
        ? `❌ ${result.message} (${result.errorCode})`
        : `❌ ${result.message}`;
      setMessage(errorMsg);
    }
  };

  // ====== Render ======
  if (loading) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">TRẠNG THÁI HỆ THỐNG</p>
        </div>
        <div className="body__inner">
          <p>Đang tải dữ liệu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRẠNG THÁI HỆ THỐNG</p>
      </div>

      <div className="body__inner">
        {/* ====== KHỐI 1: Niên khóa & Học kỳ ====== */}
        <HocKyNienKhoaShowSetup
          hocKyNienKhoas={hocKyNienKhoas}
          loadingHocKy={loadingHocKy}
          submitting={submittingHocKy}
          selectedNienKhoa={selectedNienKhoa}
          selectedHocKy={selectedHocKy}
          semesterStart={semesterStart}
          semesterEnd={semesterEnd}
          currentSemester={currentSemester}
          semesterMessage={semesterMessage}
          onChangeNienKhoa={setSelectedNienKhoa}
          onChangeHocKy={setSelectedHocKy}
          onChangeStart={setSemesterStart}
          onChangeEnd={setSemesterEnd}
          onSubmit={handleSubmitSemester}
        />

        {/* ====== KHỐI 2: Chuyển trạng thái ====== */}
        <PhaseHocKyNienKhoaSetup
          phaseNames={PHASE_NAMES}
          phaseOrder={PHASE_ORDER}
          phaseTimes={phaseTimes}
          currentPhase={currentPhase}
          message={message}
          semesterStart={semesterStart}
          semesterEnd={semesterEnd}
          submitting={submittingPhases}
          onPhaseTimeChange={handlePhaseTimeChange}
          onSubmit={handleSubmitPhases}
        />
      </div>
    </section>
  );
}

/* =============== helpers =============== */
function toLocalDatetime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
