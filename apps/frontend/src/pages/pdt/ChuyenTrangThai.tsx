import { useEffect, useState, type FormEvent } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import {
  useHocKyNienKhoa,
  useSetHocKyHienTai,
  useCreateBulkKyPhase,
} from "../../features/pdt/hooks";
import { HocKyNienKhoaShowSetup } from "./components/HocKyNienKhoaShowSetup";
import { PhaseHocKyNienKhoaSetup } from "./components/PhaseHocKyNienKhoaSetup";
import type { SetHocKyHienTaiRequest, PhaseItemDTO } from "../../features/pdt";

type PhaseTime = { start: string; end: string };

type CurrentSemester = {
  ten_hoc_ky?: string | null;
  ten_nien_khoa?: string | null;
  ngay_bat_dau?: string | null;
  ngay_ket_thuc?: string | null;
};

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
  // ✅ Dùng hooks
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();
  const { setHocKyHienTai, loading: submittingHocKy } = useSetHocKyHienTai();
  const { createBulkKyPhase, loading: submittingPhase } =
    useCreateBulkKyPhase();

  // State cho học kỳ/niên khóa
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");
  const [semesterStart, setSemesterStart] = useState<string>("");
  const [semesterEnd, setSemesterEnd] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester>({});
  const [semesterMessage, setSemesterMessage] = useState<string>("");

  // State cho phases
  const [phaseTimes, setPhaseTimes] = useState<Record<string, PhaseTime>>({
    de_xuat_phe_duyet: { start: "", end: "" },
    ghi_danh: { start: "", end: "" },
    sap_xep_tkb: { start: "", end: "" },
    dang_ky_hoc_phan: { start: "", end: "" },
    binh_thuong: { start: "", end: "" },
  });
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // ✅ Auto-select niên khóa và học kỳ đầu tiên khi data load xong
  useEffect(() => {
    if (hocKyNienKhoas.length > 0 && !selectedNienKhoa) {
      const firstNienKhoa = hocKyNienKhoas[0];
      setSelectedNienKhoa(firstNienKhoa.id);

      if (firstNienKhoa.hocKy.length > 0) {
        setSelectedHocKy(firstNienKhoa.hocKy[0].id);
      }
    }
  }, [hocKyNienKhoas, selectedNienKhoa]);

  // ✅ Khi đổi niên khóa -> auto select học kỳ đầu tiên
  const handleChangeNienKhoa = (value: string) => {
    setSelectedNienKhoa(value);
    const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === value);
    if (nienKhoa?.hocKy.length) {
      setSelectedHocKy(nienKhoa.hocKy[0].id);
    } else {
      setSelectedHocKy("");
    }
  };

  // ✅ Submit học kỳ/niên khóa
  const handleSubmitSemester = async (e: FormEvent) => {
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

    const payload: SetHocKyHienTaiRequest = {
      id_nien_khoa: selectedNienKhoa,
      id_hoc_ky: selectedHocKy,
      ngay_bat_dau: semesterStart,
      ngay_ket_thuc: semesterEnd,
    };

    const result = await setHocKyHienTai(payload);

    if (result.isSuccess) {
      setSemesterMessage("✅ Thiết lập học kỳ hiện tại thành công");

      // Cập nhật hiển thị
      const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === selectedNienKhoa);
      const hocKy = nienKhoa?.hocKy.find((hk) => hk.id === selectedHocKy);

      setCurrentSemester({
        ten_hoc_ky: hocKy?.tenHocKy,
        ten_nien_khoa: nienKhoa?.tenNienKhoa,
        ngay_bat_dau: semesterStart,
        ngay_ket_thuc: semesterEnd,
      });
    } else {
      setSemesterMessage(result.message || "❌ Không thể thiết lập học kỳ");
    }
  };

  // ✅ Handle phase time change
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

  // ✅ Submit phases
  const handleSubmitPhases = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validate
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

    const phases: PhaseItemDTO[] = PHASE_ORDER.map((phase) => ({
      phase,
      startAt: new Date(phaseTimes[phase].start).toISOString(),
      endAt: new Date(phaseTimes[phase].end).toISOString(),
    }));

    const result = await createBulkKyPhase({
      hocKyId: selectedHocKy,
      phases,
    });
    if (result.isSuccess) {
      setMessage("✅ Cập nhật trạng thái hệ thống thành công");
    } else {
      setMessage(result.message || "❌ Không thể cập nhật trạng thái");
    }
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRẠNG THÁI HỆ THỐNG</p>
      </div>

      <div className="body__inner">
        {/* ✅ Component học kỳ/niên khóa */}
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
          onChangeNienKhoa={handleChangeNienKhoa}
          onChangeHocKy={setSelectedHocKy}
          onChangeStart={setSemesterStart}
          onChangeEnd={setSemesterEnd}
          onSubmit={handleSubmitSemester}
        />

        {/* ✅ Component phases */}
        <PhaseHocKyNienKhoaSetup
          phaseNames={PHASE_NAMES}
          phaseOrder={PHASE_ORDER}
          phaseTimes={phaseTimes}
          currentPhase={currentPhase}
          message={message}
          semesterStart={semesterStart}
          semesterEnd={semesterEnd}
          submitting={submittingPhase}
          onPhaseTimeChange={handlePhaseTimeChange}
          onSubmit={handleSubmitPhases}
        />
      </div>
    </section>
  );
}
