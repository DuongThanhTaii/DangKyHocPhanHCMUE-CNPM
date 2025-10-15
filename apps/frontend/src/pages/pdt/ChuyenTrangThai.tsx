import { useEffect, useState, type FormEvent } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import {
  useHocKyNienKhoa,
  useSetHocKyHienTai,
  useCreateBulkKyPhase,
  useGetHocKyHienHanh, // ✅ Hook lấy học kỳ hiện hành
  usePhasesByHocKy, // ✅ Hook lấy phases
} from "../../features/pdt/hooks";
import { HocKyNienKhoaShowSetup } from "./components/HocKyNienKhoaShowSetup";
import { PhaseHocKyNienKhoaSetup } from "./components/PhaseHocKyNienKhoaSetup";
import type { SetHocKyHienTaiRequest, PhaseItemDTO } from "../../features/pdt";
import { toDatetimeLocal } from "../../utils/dateHelpers";
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

  // ✅ 1. Lấy học kỳ hiện hành
  const { data: hocKyHienHanh, loading: loadingHienHanh } =
    useGetHocKyHienHanh();

  const [selectedHocKyId, setSelectedHocKyId] = useState<string | null>(null);

  // ✅ 2. Lấy phases theo học kỳ đang chọn
  const { data: phasesData, loading: loadingPhases } =
    usePhasesByHocKy(selectedHocKyId);

  // State cho học kỳ/niên khóa
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
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

  // ✅ 3. Load học kỳ hiện hành khi mount
  useEffect(() => {
    if (!hocKyHienHanh) return;

    // Set học kỳ/niên khóa
    setSelectedNienKhoa(hocKyHienHanh.nienKhoaId);
    setSelectedHocKyId(hocKyHienHanh.hocKyId); // ✅ Trigger load phases

    // Set ngày bắt đầu/kết thúc học kỳ
    setSemesterStart(
      hocKyHienHanh.ngayBatDau ? hocKyHienHanh.ngayBatDau.split("T")[0] : ""
    );
    setSemesterEnd(
      hocKyHienHanh.ngayKetThuc ? hocKyHienHanh.ngayKetThuc.split("T")[0] : ""
    );

    // Set current semester display
    setCurrentSemester({
      ten_hoc_ky: hocKyHienHanh.tenHocKy,
      ten_nien_khoa: hocKyHienHanh.tenNienKhoa,
      ngay_bat_dau: hocKyHienHanh.ngayBatDau
        ? hocKyHienHanh.ngayBatDau.split("T")[0]
        : "",
      ngay_ket_thuc: hocKyHienHanh.ngayKetThuc
        ? hocKyHienHanh.ngayKetThuc.split("T")[0]
        : "",
    });
  }, [hocKyHienHanh]);

  // ✅ 4. Load phases khi có data
  useEffect(() => {
    if (!phasesData) return;

    // Set phases times
    const newPhaseTimes: Record<string, PhaseTime> = {};
    phasesData.phases.forEach((phase) => {
      // ✅ Convert ISO string sang datetime-local format
      newPhaseTimes[phase.phase] = {
        start: toDatetimeLocal(phase.startAt), // ✅ "2025-06-25T08:00"
        end: toDatetimeLocal(phase.endAt),
      };
    });

    setPhaseTimes(newPhaseTimes);

    // Set phase hiện tại
    const now = new Date();
    const currentPhaseItem = phasesData.phases.find((p) => {
      const start = new Date(p.startAt);
      const end = new Date(p.endAt);
      return p.isEnabled && now >= start && now <= end;
    });

    if (currentPhaseItem) {
      setCurrentPhase(currentPhaseItem.phase);
    }
  }, [phasesData]);

  // ✅ 5. Handler khi chọn học kỳ khác
  const handleChangeHocKy = (hocKyId: string) => {
    setSelectedHocKyId(hocKyId); // ✅ Trigger usePhasesByHocKy re-fetch
  };

  // ✅ Auto-select niên khóa và học kỳ đầu tiên khi data load xong
  useEffect(() => {
    if (hocKyNienKhoas.length > 0 && !selectedNienKhoa) {
      const firstNienKhoa = hocKyNienKhoas[0];
      setSelectedNienKhoa(firstNienKhoa.id);

      if (firstNienKhoa.hocKy.length > 0) {
        setSelectedHocKyId(firstNienKhoa.hocKy[0].id);
      }
    }
  }, [hocKyNienKhoas, selectedNienKhoa]);

  // ✅ Khi đổi niên khóa -> auto select học kỳ đầu tiên
  const handleChangeNienKhoa = (value: string) => {
    setSelectedNienKhoa(value);
    const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === value);
    if (nienKhoa?.hocKy.length) {
      setSelectedHocKyId(nienKhoa.hocKy[0].id);
    } else {
      setSelectedHocKyId("");
    }
  };

  // ✅ Submit học kỳ/niên khóa
  const handleSubmitSemester = async (e: FormEvent) => {
    e.preventDefault();
    setSemesterMessage("");

    if (!selectedNienKhoa || !selectedHocKyId) {
      setSemesterMessage("❌ Vui lòng chọn đầy đủ Niên khóa & Học kỳ");
      return;
    }
    if (!semesterStart || !semesterEnd) {
      setSemesterMessage("❌ Vui lòng nhập ngày bắt đầu/kết thúc");
      return;
    }

    const payload: SetHocKyHienTaiRequest = {
      id_nien_khoa: selectedNienKhoa,
      id_hoc_ky: selectedHocKyId,
      ngay_bat_dau: semesterStart,
      ngay_ket_thuc: semesterEnd,
    };

    const result = await setHocKyHienTai(payload);

    if (result.isSuccess) {
      setSemesterMessage("✅ Thiết lập học kỳ hiện tại thành công");

      // Cập nhật hiển thị
      const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === selectedNienKhoa);
      const hocKy = nienKhoa?.hocKy.find((hk) => hk.id === selectedHocKyId);

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

    if (!selectedHocKyId) {
      setMessage("❌ Vui lòng chọn học kỳ trước");
      return;
    }

    // ✅ Validate khoa configs (nếu có component reference)
    // Hoặc pass callback validation từ component con lên

    const phases: PhaseItemDTO[] = PHASE_ORDER.map((phase) => ({
      phase,
      startAt: new Date(phaseTimes[phase].start).toISOString(),
      endAt: new Date(phaseTimes[phase].end).toISOString(),
    }));

    const result = await createBulkKyPhase({
      hocKyId: selectedHocKyId,
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
        {/* Loading states */}
        {(loadingHienHanh || loadingPhases) && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Đang tải dữ liệu...
          </p>
        )}

        {/* ✅ Component học kỳ/niên khóa */}
        <HocKyNienKhoaShowSetup
          hocKyNienKhoas={hocKyNienKhoas}
          loadingHocKy={loadingHocKy}
          submitting={submittingHocKy}
          selectedNienKhoa={selectedNienKhoa}
          selectedHocKy={selectedHocKyId || ""}
          semesterStart={semesterStart}
          semesterEnd={semesterEnd}
          currentSemester={currentSemester}
          semesterMessage={semesterMessage}
          onChangeNienKhoa={handleChangeNienKhoa}
          onChangeHocKy={handleChangeHocKy} // ✅ Trigger load phases mới
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
