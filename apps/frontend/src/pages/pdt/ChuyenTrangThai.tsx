import { useEffect, useState, type FormEvent } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import {
  useSetHocKyHienTai,
  useCreateBulkKyPhase,
  usePhasesByHocKy,
  useUpdateDotGhiDanh,
} from "../../features/pdt/hooks";
import { HocKyNienKhoaShowSetup } from "./components/HocKyNienKhoaShowSetup";
import { PhaseHocKyNienKhoaSetup } from "./components/PhaseHocKyNienKhoaSetup";
import type { SetHocKyHienTaiRequest, PhaseItemDTO } from "../../features/pdt";
import { toDatetimeLocal } from "../../utils/dateHelpers";
import {
  useHocKyHienHanh,
  useHocKyNienKhoa,
  useUpdateHocKyDate, // ✅ Add new import
} from "../../features/common/hooks";
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
  const { updateHocKyDate, loading: updatingHocKyDate } = useUpdateHocKyDate(); // ✅ Add new hook

  // ✅ THÊM: Lấy học kỳ hiện hành để auto-select
  const { data: hocKyHienHanh, loading: loadingHienHanh } = useHocKyHienHanh();

  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  // ✅ Gọi hook để load phases
  const { data: phasesData, loading: loadingPhases } =
    usePhasesByHocKy(selectedHocKyId);

  // State cho học kỳ/niên khó
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [semesterStart, setSemesterStart] = useState<string>("");
  const [semesterEnd, setSemesterEnd] = useState<string>("");
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester>({});
  const [semesterMessage, setSemesterMessage] = useState<string>("");

  // State cho phases
  const [phaseTimes, setPhaseTimes] = useState<Record<string, PhaseTime>>(
    getEmptyPhaseTimes()
  );
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ FIX: Auto-select học kỳ hiện hành khi mount
  useEffect(() => {
    if (!hocKyHienHanh || hocKyNienKhoas.length === 0) return;

    console.log("✅ [ChuyenTrangThai] hocKyHienHanh:", hocKyHienHanh);
    console.log("✅ [ChuyenTrangThai] hocKyNienKhoas:", hocKyNienKhoas);

    // ✅ Tìm niên khóa chứa học kỳ này
    const foundNienKhoa = hocKyNienKhoas.find((nk) =>
      nk.hocKy.some((hk) => hk.id === hocKyHienHanh.id)
    );

    if (!foundNienKhoa) {
      console.error(
        "❌ [ChuyenTrangThai] Không tìm thấy niên khóa cho học kỳ:",
        hocKyHienHanh.id
      );
      return;
    }

    const foundHocKy = foundNienKhoa.hocKy.find(
      (hk) => hk.id === hocKyHienHanh.id
    );

    if (!foundHocKy) {
      console.error(
        "❌ [ChuyenTrangThai] Không tìm thấy học kỳ:",
        hocKyHienHanh.id
      );
      return;
    }

    console.log("✅ [ChuyenTrangThai] Found niên khóa:", foundNienKhoa);
    console.log("✅ [ChuyenTrangThai] Found học kỳ:", foundHocKy);

    // ✅ Set niên khóa
    setSelectedNienKhoa(foundNienKhoa.nienKhoaId);

    // ✅ Set học kỳ
    setSelectedHocKyId(foundHocKy.id);

    // ✅ Set ngày bắt đầu/kết thúc
    setSemesterStart(
      foundHocKy.ngayBatDau
        ? new Date(foundHocKy.ngayBatDau).toISOString().split("T")[0]
        : ""
    );
    setSemesterEnd(
      foundHocKy.ngayKetThuc
        ? new Date(foundHocKy.ngayKetThuc).toISOString().split("T")[0]
        : ""
    );

    // ✅ Set current semester info
    setCurrentSemester({
      ten_hoc_ky: foundHocKy.tenHocKy,
      ten_nien_khoa: foundNienKhoa.tenNienKhoa,
      ngay_bat_dau: foundHocKy.ngayBatDau
        ? new Date(foundHocKy.ngayBatDau).toISOString().split("T")[0]
        : "",
      ngay_ket_thuc: foundHocKy.ngayKetThuc
        ? new Date(foundHocKy.ngayKetThuc).toISOString().split("T")[0]
        : "",
    });
  }, [hocKyHienHanh, hocKyNienKhoas]);

  // ✅ Load phases từ API khi có selectedHocKyId
  useEffect(() => {
    console.log("🔄 [ChuyenTrangThai] useEffect for phasesData triggered");
    console.log("📦 selectedHocKyId:", selectedHocKyId);
    console.log("📦 phasesData:", phasesData);
    console.log(
      "📦 phasesData type:",
      Array.isArray(phasesData) ? "Array" : typeof phasesData
    );

    if (!selectedHocKyId) {
      setPhaseTimes(getEmptyPhaseTimes());
      setCurrentPhase("");
      return;
    }

    // ✅ FIX: Check if phasesData is object with phases property OR direct array
    const phases =
      phasesData?.phases || (Array.isArray(phasesData) ? phasesData : []);

    if (!phases || phases.length === 0) {
      console.log("⚠️ [ChuyenTrangThai] No phases data, using empty");
      setPhaseTimes(getEmptyPhaseTimes());
      setCurrentPhase("");
      return;
    }

    console.log("✅ [ChuyenTrangThai] Loading phases:", phases);

    const newPhaseTimes: Record<string, PhaseTime> = getEmptyPhaseTimes();

    // ✅ Map API data to local state
    phases.forEach((phase: any) => {
      newPhaseTimes[phase.phase] = {
        start: toDatetimeLocal(phase.startAt),
        end: toDatetimeLocal(phase.endAt),
      };
    });

    console.log("✅ [ChuyenTrangThai] New phase times:", newPhaseTimes);
    setPhaseTimes(newPhaseTimes);

    // ✅ Xác định phase hiện tại
    const now = new Date();
    const currentPhaseItem = phases.find((p: any) => {
      const start = new Date(p.startAt);
      const end = new Date(p.endAt);
      return p.isEnabled && now >= start && now <= end;
    });

    if (currentPhaseItem) {
      console.log(
        "✅ [ChuyenTrangThai] Current phase:",
        currentPhaseItem.phase
      );
      setCurrentPhase(currentPhaseItem.phase);
    } else {
      console.log("⚠️ [ChuyenTrangThai] No active phase");
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
    const nienKhoa = hocKyNienKhoas.find((nk) => nk.nienKhoaId === value);
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

    // ✅ Debug: Log payload trước khi gửi
    const datePayload = {
      hocKyId: selectedHocKyId,
      ngayBatDau: semesterStart,
      ngayKetThuc: semesterEnd,
    };
    console.log("📤 Sending date payload:", datePayload);

    // ✅ Step 1: Update ngày bắt đầu/kết thúc trước
    const updateDateResult = await updateHocKyDate(datePayload);

    console.log("📥 Date update result:", updateDateResult);

    if (!updateDateResult.isSuccess) {
      setSemesterMessage(
        `❌ ${updateDateResult.message || "Không thể cập nhật ngày học kỳ"}`
      );
      return;
    }

    // ✅ Step 2: Set học kỳ hiện tại
    const payload: SetHocKyHienTaiRequest = {
      id_nien_khoa: selectedNienKhoa,
      id_hoc_ky: selectedHocKyId,
      ngay_bat_dau: semesterStart,
      ngay_ket_thuc: semesterEnd,
    };

    const result = await setHocKyHienTai(payload);

    if (result.isSuccess) {
      setSemesterMessage("✅ Thiết lập học kỳ hiện tại thành công");

      const nienKhoa = hocKyNienKhoas.find(
        (nk) => nk.nienKhoaId === selectedNienKhoa
      );
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

  // ✅ FIX: Submit phases - gọi đúng API
  const handleSubmitPhases = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!selectedHocKyId) {
      setMessage("❌ Vui lòng chọn học kỳ trước");
      return;
    }

    // ✅ FIX: Kiểm tra từ state thay vì từ hocKy object
    if (!semesterStart || !semesterEnd) {
      setMessage(
        "❌ Học kỳ chưa có ngày bắt đầu/kết thúc. Vui lòng thiết lập ở phần trên."
      );
      return;
    }

    // ✅ Validate all phases have times
    const emptyPhases = PHASE_ORDER.filter(
      (phase) => !phaseTimes[phase]?.start || !phaseTimes[phase]?.end
    );

    if (emptyPhases.length > 0) {
      setMessage("❌ Vui lòng nhập đầy đủ thời gian cho tất cả các giai đoạn");
      return;
    }

    const phases: PhaseItemDTO[] = PHASE_ORDER.map((phase) => ({
      phase,
      startAt: new Date(phaseTimes[phase].start).toISOString(),
      endAt: new Date(phaseTimes[phase].end).toISOString(),
    }));

    // ✅ FIX: Dùng state semesterStart/semesterEnd thay vì hocKy object
    const result = await createBulkKyPhase({
      hocKyId: selectedHocKyId,
      hocKyStartAt: semesterStart, // ✅ Dùng state
      hocKyEndAt: semesterEnd, // ✅ Dùng state
      phases,
    });

    if (result.isSuccess) {
      setMessage("✅ Cập nhật trạng thái hệ thống thành công");
    } else {
      setMessage(result.message || "❌ Không thể cập nhật trạng thái");
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

    const nienKhoa = hocKyNienKhoas.find(
      (nk) => nk.nienKhoaId === selectedNienKhoa
    );
    const hocKy = nienKhoa?.hocKy.find((hk) => hk.id === selectedHocKyId);

    console.log("🔍 Found học kỳ:", hocKy);

    if (hocKy) {
      // ✅ WORKAROUND: Chỉ set nếu BE đã gửi, không thì để user tự nhập
      const startDate = hocKy.ngayBatDau
        ? new Date(hocKy.ngayBatDau).toISOString().split("T")[0]
        : semesterStart; // ✅ Giữ giá trị cũ nếu không có từ BE
      const endDate = hocKy.ngayKetThuc
        ? new Date(hocKy.ngayKetThuc).toISOString().split("T")[0]
        : semesterEnd; // ✅ Giữ giá trị cũ nếu không có từ BE

      console.log("📅 Setting dates:", { startDate, endDate });

      setSemesterStart(startDate);
      setSemesterEnd(endDate);

      // ✅ Hiển thị thông báo nếu BE chưa gửi dữ liệu
      if (!hocKy.ngayBatDau || !hocKy.ngayKetThuc) {
        setSemesterMessage(
          "⚠️ Vui lòng nhập ngày bắt đầu/kết thúc học kỳ ở phần trên trước khi thiết lập phase"
        );
      }
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
        {/* ✅ Hiển thị loading state */}
        {(loadingHienHanh || loadingPhases) && (
          <p style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
            Đang tải dữ liệu...
          </p>
        )}

        {/* ✅ Component học kỳ/niên khóa (UI không đổi) */}
        <HocKyNienKhoaShowSetup
          hocKyNienKhoas={hocKyNienKhoas}
          loadingHocKy={loadingHocKy}
          submitting={submittingHocKy || updatingHocKyDate} // ✅ Add updatingHocKyDate
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

        {/* ✅ Component phases (UI không đổi) */}
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
