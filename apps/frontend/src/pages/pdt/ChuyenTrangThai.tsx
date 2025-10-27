import { useEffect, useState, type FormEvent } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import {
  useHocKyNienKhoa,
  useSetHocKyHienTai,
  useCreateBulkKyPhase,
  useGetHocKyHienHanh,
  usePhasesByHocKy,
  useUpdateDotGhiDanh,
} from "../../features/pdt/hooks";
import { HocKyNienKhoaShowSetup } from "./components/HocKyNienKhoaShowSetup";
import { PhaseHocKyNienKhoaSetup } from "./components/PhaseHocKyNienKhoaSetup";
import type { SetHocKyHienTaiRequest, PhaseItemDTO } from "../../features/pdt";
import { toDatetimeLocal } from "../../utils/dateHelpers";
import KhoaFilterForPhase from "./components/KhoaFilterForPhase";
import PhaseTimeEditor from "./components/PhaseTimeEditor";
import { useModalContext } from "../../hook/ModalContext";

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

// ✅ MOVE HERE - Define helper function BEFORE component
const getEmptyPhaseTimes = (): Record<string, PhaseTime> => {
  return PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = { start: "", end: "" };
    return acc;
  }, {} as Record<string, PhaseTime>);
};

export default function ChuyenTrangThai() {
  const { openNotify } = useModalContext();

  // ✅ Dùng hooks
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();
  const { setHocKyHienTai, loading: submittingHocKy } = useSetHocKyHienTai();
  const { createBulkKyPhase, loading: submittingPhase } =
    useCreateBulkKyPhase();
  const { updateDotGhiDanh, loading: ghiDanhLoading } = useUpdateDotGhiDanh();

  const { data: hocKyHienHanh, loading: loadingHienHanh } =
    useGetHocKyHienHanh();

  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  const { data: phasesData, loading: loadingPhases } =
    usePhasesByHocKy(selectedHocKyId);

  // State cho học kỳ/niên khóa
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [semesterStart, setSemesterStart] = useState<string>("");
  const [semesterEnd, setSemesterEnd] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester>({});
  const [semesterMessage, setSemesterMessage] = useState<string>("");

  // State cho phases - ✅ Now getEmptyPhaseTimes is defined
  const [phaseTimes, setPhaseTimes] = useState<Record<string, PhaseTime>>(
    getEmptyPhaseTimes()
  );
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load học kỳ hiện hành khi mount
  useEffect(() => {
    if (!hocKyHienHanh) return;

    console.log(
      "🔍 [ChuyenTrangThai] Auto-selecting from hocKyHienHanh:",
      hocKyHienHanh
    );

    setSelectedNienKhoa(hocKyHienHanh.nienKhoaId);
    setSelectedHocKyId(hocKyHienHanh.id);

    setSemesterStart(
      hocKyHienHanh.ngayBatDau ? hocKyHienHanh.ngayBatDau.split("T")[0] : ""
    );
    setSemesterEnd(
      hocKyHienHanh.ngayKetThuc ? hocKyHienHanh.ngayKetThuc.split("T")[0] : ""
    );

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

    console.log(
      "✅ [ChuyenTrangThai] Set selectedNienKhoa:",
      hocKyHienHanh.nienKhoaId
    );
    console.log("✅ [ChuyenTrangThai] Set selectedHocKyId:", hocKyHienHanh.id);
  }, [hocKyHienHanh]);

  // ✅ Load phases khi có data
  useEffect(() => {
    if (selectedHocKyId && !phasesData) {
      setPhaseTimes(getEmptyPhaseTimes());
      setCurrentPhase("");
      return;
    }

    if (!phasesData) return;

    const newPhaseTimes: Record<string, PhaseTime> = getEmptyPhaseTimes();

    phasesData.phases.forEach((phase) => {
      newPhaseTimes[phase.phase] = {
        start: toDatetimeLocal(phase.startAt),
        end: toDatetimeLocal(phase.endAt),
      };
    });

    setPhaseTimes(newPhaseTimes);

    const now = new Date();
    const currentPhaseItem = phasesData.phases.find((p) => {
      const start = new Date(p.startAt);
      const end = new Date(p.endAt);
      return p.isEnabled && now >= start && now <= end;
    });

    if (currentPhaseItem) {
      setCurrentPhase(currentPhaseItem.phase);
    } else {
      setCurrentPhase("");
    }
  }, [phasesData, selectedHocKyId]);

  // ✅ Handler khi chọn học kỳ khác
  const handleChangeHocKy = (hocKyId: string) => {
    setSelectedHocKyId(hocKyId);
    setPhaseTimes(getEmptyPhaseTimes());
    setCurrentPhase("");
    setMessage("");
  };

  // ✅ Khi đổi niên khóa
  const handleChangeNienKhoa = (value: string) => {
    setSelectedNienKhoa(value);
    const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === value);
    if (nienKhoa?.hocKy.length) {
      setSelectedHocKyId(nienKhoa.hocKy[0].id);
    } else {
      setSelectedHocKyId("");
    }
    setPhaseTimes(getEmptyPhaseTimes());
    setCurrentPhase("");
    setMessage("");
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

  const handleSubmitPhases = async (e: FormEvent) => {
    console.log("🔥🔥🔥 handleSubmitPhases CALLED!");
    console.log("📦 Event:", e);

    e.preventDefault();

    console.log("📦 State before submit:");
    console.log("  - selectedHocKyId:", selectedHocKyId);
    console.log("  - phaseTimes:", phaseTimes);
    console.log("  - semesterStart:", semesterStart);
    console.log("  - semesterEnd:", semesterEnd);

    setMessage("");

    if (!selectedHocKyId) {
      console.log("❌ No hocKyId - returning early");
      setMessage("❌ Vui lòng chọn học kỳ trước");
      return;
    }

    // ✅ Validate semester dates
    if (!semesterStart || !semesterEnd) {
      console.log("❌ Missing semester dates");
      setMessage("❌ Vui lòng thiết lập ngày bắt đầu/kết thúc học kỳ trước");
      return;
    }

    // Check if all phases have times
    const emptyPhases = PHASE_ORDER.filter(
      (phase) => !phaseTimes[phase]?.start || !phaseTimes[phase]?.end
    );

    if (emptyPhases.length > 0) {
      console.log("❌ Empty phases found:", emptyPhases);
      setMessage("❌ Vui lòng nhập đầy đủ thời gian cho tất cả các giai đoạn");
      return;
    }

    console.log("✅ All validations passed, preparing phases...");

    const phases: PhaseItemDTO[] = PHASE_ORDER.map((phase) => ({
      phase,
      startAt: new Date(phaseTimes[phase].start).toISOString(),
      endAt: new Date(phaseTimes[phase].end).toISOString(),
    }));

    console.log("📦 Phases to submit:", JSON.stringify(phases, null, 2));
    console.log("🚀 Calling createBulkKyPhase API...");

    try {
      const result = await createBulkKyPhase({
        hocKyId: selectedHocKyId,
        hocKyStartAt: semesterStart, // ✅ Pass học kỳ start date
        hocKyEndAt: semesterEnd, // ✅ Pass học kỳ end date
        phases,
      });

      console.log("📦 API Response:", result);

      if (result.isSuccess) {
        console.log("✅ Success!");
        setMessage("✅ Cập nhật trạng thái hệ thống thành công");
      } else {
        console.log("❌ Failed:", result.message);
        setMessage(result.message || "❌ Không thể cập nhật trạng thái");
      }
    } catch (error: any) {
      console.error("💥 Exception caught:", error);
      setMessage(`❌ Lỗi: ${error.message}`);
    }
  };

  // ✅ Submit ghi danh
  const handleSubmitGhiDanh = async (data: any) => {
    setSubmitting(true);
    try {
      const result = await updateDotGhiDanh(data);

      if (result.isSuccess) {
        setMessage((prev) =>
          prev
            ? `${prev}\n✅ Cập nhật đợt ghi danh thành công`
            : "✅ Cập nhật đợt ghi danh thành công"
        );
      } else {
        setMessage((prev) =>
          prev ? `${prev}\n❌ ${result.message}` : `❌ ${result.message}`
        );
      }
    } catch (error: any) {
      setMessage((prev) =>
        prev ? `${prev}\n❌ Lỗi: ${error.message}` : `❌ Lỗi: ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Load ngày bắt đầu/kết thúc từ học kỳ được chọn
  useEffect(() => {
    if (!selectedHocKyId) return;

    const nienKhoa = hocKyNienKhoas.find((nk) => nk.id === selectedNienKhoa);
    const hocKy = nienKhoa?.hocKy.find((hk) => hk.id === selectedHocKyId);

    console.log("🔍 Found học kỳ:", hocKy);

    if (hocKy) {
      // ✅ Set semester dates from học kỳ
      const startDate = hocKy.ngayBatDau
        ? new Date(hocKy.ngayBatDau).toISOString().split("T")[0]
        : "";
      const endDate = hocKy.ngayKetThuc
        ? new Date(hocKy.ngayKetThuc).toISOString().split("T")[0]
        : "";

      console.log("📅 Setting dates:", { startDate, endDate });

      setSemesterStart(startDate);
      setSemesterEnd(endDate);
    }
  }, [selectedHocKyId, selectedNienKhoa, hocKyNienKhoas]);

  // ✅ New state for Khoa filter
  const [selectedKhoa, setSelectedKhoa] = useState<string>("all");

  // ✅ Mock phase time data (TODO: fetch from API)
  const ghiDanhPhaseData = {
    label: "📝 Phase Ghi Danh",
    start: phaseTimes["ghi_danh"]?.start || "",
    end: phaseTimes["ghi_danh"]?.end || "",
    status: (currentPhase === "ghi_danh" ? "active" : "upcoming") as
      | "active"
      | "upcoming"
      | "ended",
  };

  const dangKyPhaseData = {
    label: "📚 Phase Đăng Ký Học Phần",
    start: phaseTimes["dang_ky_hoc_phan"]?.start || "",
    end: phaseTimes["dang_ky_hoc_phan"]?.end || "",
    status: (currentPhase === "dang_ky_hoc_phan" ? "active" : "upcoming") as
      | "active"
      | "upcoming"
      | "ended",
  };

  const handleUpdatePhaseTime = (
    phaseType: "ghi_danh" | "dang_ky",
    start: string,
    end: string
  ) => {
    // TODO: Call API to update phase time
    console.log("Update phase time:", { phaseType, start, end });

    openNotify({
      message: `API chỉnh thời gian ${
        phaseType === "ghi_danh" ? "Ghi Danh" : "Đăng Ký"
      } đang được phát triển`,
      type: "info",
    });

    // ✅ Update local state for preview
    const phaseKey = phaseType === "ghi_danh" ? "ghi_danh" : "dang_ky_hoc_phan";
    setPhaseTimes((prev) => ({
      ...prev,
      [phaseKey]: { start, end },
    }));
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
          onChangeHocKy={handleChangeHocKy}
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
          submitting={submittingPhase || ghiDanhLoading || submitting}
          selectedHocKyId={selectedHocKyId || ""}
          onPhaseTimeChange={handlePhaseTimeChange}
          onSubmit={handleSubmitPhases}
          onSubmitGhiDanh={handleSubmitGhiDanh}
        />
      </div>
    </section>
  );
}
