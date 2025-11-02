import { useState, useMemo } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useModalContext } from "../../hook/ModalContext";
import { useHocKyHienHanh } from "../../features/common/hooks";
import {
  useCheckPhaseDangKy,
  useDanhSachLopHocPhan,
  useLopDaDangKy,
  useDangKyActions,
  useChuyenLopHocPhan,
  useLopChuaDangKyByMonHoc,
} from "../../features/sv/hooks";
import type { MonHocInfoDTO, LopHocPhanItemDTO } from "../../features/sv/types";
import DangKyLopModal from "./components/DangKyLopModal";
import ChuyenLopModal from "./components/ChuyenLopModal";

export default function DangKyHocPhan() {
  const { openNotify, openConfirm } = useModalContext();

  const { data: hocKyHienHanh, loading: loadingHocKy } = useHocKyHienHanh();
  const hocKyId = hocKyHienHanh?.id || "";

  const { canRegister, loading: checkingPhase } = useCheckPhaseDangKy(hocKyId);
  const {
    data: lopHocPhanData,
    loading: loadingLop,
    refetch: refetchLop,
  } = useDanhSachLopHocPhan(hocKyId);
  const {
    data: lopDaDangKy,
    loading: loadingDaDK,
    refetch: refetchDaDK,
  } = useLopDaDangKy(hocKyId);
  const { dangKy, huyDangKy, loading: submitting } = useDangKyActions();
  const { chuyenLop, loading: chuyenLopLoading } = useChuyenLopHocPhan();
  const {
    data: lopChuaDangKy,
    loading: loadingLopChuaDK,
    fetchLop: fetchLopChuaDangKy,
  } = useLopChuaDangKyByMonHoc();

  const [activeTab, setActiveTab] = useState<"monChung" | "batBuoc" | "tuChon">(
    "monChung"
  );
  const [selectedMonHoc, setSelectedMonHoc] = useState<MonHocInfoDTO | null>(
    null
  );
  const [selectedToCancelIds, setSelectedToCancelIds] = useState<string[]>([]);
  const [chuyenLopModalData, setChuyenLopModalData] = useState<{
    lopCu: {
      lopId: string;
      monHocId: string;
      maMon: string;
      tenMon: string;
      tenLop: string;
    };
  } | null>(null);

  // ✅ Check môn đã đăng ký dựa trên MÃ MÔN (không phải lopId)
  const isDaDangKyMonHoc = (maMon: string) => {
    return lopDaDangKy.some((mon) => mon.maMon === maMon);
  };

  // ✅ Check lớp cụ thể đã đăng ký (for modal)
  const isDaDangKyLop = (lopId: string) => {
    return lopDaDangKy.some((mon) =>
      mon.danhSachLop.some((lop) => lop.id === lopId)
    );
  };

  const handleOpenModal = (mon: MonHocInfoDTO) => {
    setSelectedMonHoc(mon);
  };

  const handleCloseModal = () => {
    setSelectedMonHoc(null);
  };

  const handleDangKyLop = async (lopId: string) => {
    const result = await dangKy({
      lop_hoc_phan_id: lopId,
      hoc_ky_id: hocKyId,
    });

    if (result.isSuccess) {
      openNotify({
        message: result.message || "Đăng ký thành công",
        type: "success",
      });
      await Promise.all([refetchLop(), refetchDaDK()]);
      handleCloseModal();
    } else {
      openNotify({
        message: result.message || "Đăng ký thất bại",
        type: "error",
      });
    }
  };

  const handleCancelCheck = (lopId: string) => {
    setSelectedToCancelIds((prev) =>
      prev.includes(lopId) ? prev.filter((x) => x !== lopId) : [...prev, lopId]
    );
  };

  // ✅ Handle mở modal chuyển lớp
  const handleOpenChuyenLopModal = async (lop: {
    lopId: string;
    maMon: string;
    tenMon: string;
    tenLop: string;
  }) => {
    // ✅ Tìm monHocId từ lopDaDangKy
    const monHoc = lopDaDangKy.find((mon) =>
      mon.danhSachLop.some((l) => l.id === lop.lopId)
    );

    if (!monHoc) {
      openNotify({ message: "Không tìm thấy môn học", type: "error" });
      return;
    }

    setChuyenLopModalData({
      lopCu: {
        lopId: lop.lopId,
        monHocId: monHoc.maMon, // ✅ Tạm dùng maMon làm ID
        maMon: lop.maMon,
        tenMon: lop.tenMon,
        tenLop: lop.tenLop,
      },
    });

    // ✅ Load lớp chưa đăng ký
    await fetchLopChuaDangKy(monHoc.maMon, hocKyId);
  };

  // ✅ Handle chuyển lớp
  const handleChuyenLop = async (lopMoiId: string) => {
    if (!chuyenLopModalData) return;

    const confirmed = await openConfirm({
      message: `Xác nhận chuyển sang lớp mới?`,
      confirmText: "Chuyển",
    });

    if (!confirmed) return;

    const result = await chuyenLop({
      lop_hoc_phan_id_cu: chuyenLopModalData.lopCu.lopId,
      lop_hoc_phan_id_moi: lopMoiId,
    });

    if (result.isSuccess) {
      openNotify({
        message: result.message || "Chuyển lớp thành công",
        type: "success",
      });
      setChuyenLopModalData(null);
      await Promise.all([refetchLop(), refetchDaDK()]);
    } else {
      openNotify({
        message: result.message || "Chuyển lớp thất bại",
        type: "error",
      });
    }
  };

  // ✅ Handle hủy đăng ký (single)
  const handleHuyDangKySingle = async (lopId: string) => {
    const confirmed = await openConfirm({
      message: "Xác nhận hủy đăng ký lớp này?",
      confirmText: "Hủy đăng ký",
    });

    if (!confirmed) return;

    const result = await huyDangKy({
      lop_hoc_phan_id: lopId, // ✅ Only pass lopId
    });

    if (result.isSuccess) {
      openNotify({
        message: result.message || "Hủy đăng ký thành công",
        type: "success",
      });
      await Promise.all([refetchLop(), refetchDaDK()]);
    } else {
      openNotify({
        message: result.message || "Hủy đăng ký thất bại",
        type: "error",
      });
    }
  };

  // ✅ Handle hủy nhiều lớp (batch)
  const handleHuyDangKy = async () => {
    if (selectedToCancelIds.length === 0) {
      openNotify({ message: "Chưa chọn lớp nào", type: "warning" });
      return;
    }

    const confirmed = await openConfirm({
      message: `Xác nhận hủy ${selectedToCancelIds.length} lớp?`,
      confirmText: "Hủy đăng ký",
    });

    if (!confirmed) return;

    let successCount = 0;
    for (const lopId of selectedToCancelIds) {
      const result = await huyDangKy({
        lop_hoc_phan_id: lopId, // ✅ Only pass lopId
      });

      if (result.isSuccess) {
        successCount++;
      }
    }

    if (successCount > 0) {
      openNotify({
        message: `Đã hủy ${successCount}/${selectedToCancelIds.length} lớp`,
        type: "success",
      });
      setSelectedToCancelIds([]);
      await Promise.all([refetchLop(), refetchDaDK()]);
    }
  };

  const renderMonHocTable = (danhSachMon: MonHocInfoDTO[]) => {
    return danhSachMon.map((mon: MonHocInfoDTO, index: number) => {
      // ✅ Check theo MÃ MÔN thay vì lopId
      const hasRegisteredLop = isDaDangKyMonHoc(mon.maMon);

      return (
        <tr
          key={mon.maMon}
          className={hasRegisteredLop ? "row__highlight" : ""}
        >
          <td>{index + 1}</td>
          <td>{mon.maMon}</td>
          <td>{mon.tenMon}</td>
          <td>{mon.soTinChi}</td>
          <td>
            {hasRegisteredLop ? (
              <span style={{ color: "#16a34a", fontWeight: 600 }}>
                ✓ Đã đăng ký
              </span>
            ) : (
              <button
                className="btn__chung"
                onClick={() => handleOpenModal(mon)}
                style={{ padding: "5px 10px", fontSize: "14px" }}
                disabled={submitting}
              >
                Đăng ký
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  // ✅ Flatten lopDaDangKy để hiển thị
  const flatDaDangKy = useMemo(() => {
    const result: Array<{
      lopId: string;
      maMon: string;
      tenMon: string;
      soTinChi: number;
      maLop: string;
      tenLop: string;
      tkbFormatted: string;
    }> = [];

    lopDaDangKy.forEach((mon) => {
      mon.danhSachLop.forEach((lop) => {
        result.push({
          lopId: lop.id,
          maMon: mon.maMon,
          tenMon: mon.tenMon,
          soTinChi: mon.soTinChi,
          maLop: lop.maLop,
          tenLop: lop.tenLop,
          tkbFormatted: lop.tkb.map((t) => t.formatted).join("\n"),
        });
      });
    });

    return result;
  }, [lopDaDangKy]);

  if (loadingHocKy || checkingPhase) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">ĐĂNG KÝ HỌC PHẦN</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          Đang tải dữ liệu...
        </div>
      </section>
    );
  }

  if (!canRegister) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">ĐĂNG KÝ HỌC PHẦN</p>
        </div>
        <div className="body__inner">
          <p
            style={{
              marginTop: 35,
              color: "red",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            CHƯA TỚI THỜI HẠN ĐĂNG KÝ HỌC PHẦN. VUI LÒNG QUAY LẠI SAU.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">ĐĂNG KÝ HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        <p className="sub__title_gd">{hocKyHienHanh?.tenHocKy}</p>

        {/* Tabs */}
        <div className="tabs-container" style={{ marginTop: 20 }}>
          <button
            className={`tab-btn ${activeTab === "monChung" ? "active" : ""}`}
            onClick={() => setActiveTab("monChung")}
          >
            Môn chung
          </button>
          <button
            className={`tab-btn ${activeTab === "batBuoc" ? "active" : ""}`}
            onClick={() => setActiveTab("batBuoc")}
          >
            Bắt buộc
          </button>
          <button
            className={`tab-btn ${activeTab === "tuChon" ? "active" : ""}`}
            onClick={() => setActiveTab("tuChon")}
          >
            Tự chọn
          </button>
        </div>

        {/* Fieldset 1: Đăng ký học phần */}
        <fieldset className="fieldeset__dkhp mt_20">
          <legend>Đăng ký học phần</legend>

          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Số TC</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loadingLop ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Đang tải...
                  </td>
                </tr>
              ) : (
                <>
                  {activeTab === "monChung" &&
                    renderMonHocTable(lopHocPhanData?.monChung || [])}
                  {activeTab === "batBuoc" &&
                    renderMonHocTable(lopHocPhanData?.batBuoc || [])}
                  {activeTab === "tuChon" &&
                    renderMonHocTable(lopHocPhanData?.tuChon || [])}
                </>
              )}
            </tbody>
          </table>

          <div className="note__gd">
            Ghi chú: <span className="note__highlight" /> đã đăng ký
          </div>
        </fieldset>

        {/* Fieldset 2: Kết quả đăng ký */}
        <fieldset className="fieldeset__dkhp mt_20">
          <legend>Kết quả đăng ký: {flatDaDangKy.length} lớp</legend>

          <table className="table">
            <thead>
              <tr>
                <th>Chọn</th>
                <th>STT</th>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Tên lớp</th>
                <th>TKB</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loadingDaDK ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    Đang tải...
                  </td>
                </tr>
              ) : flatDaDangKy.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    Chưa đăng ký lớp nào
                  </td>
                </tr>
              ) : (
                flatDaDangKy.map((lop, index) => (
                  <tr key={lop.lopId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedToCancelIds.includes(lop.lopId)}
                        onChange={() => handleCancelCheck(lop.lopId)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{lop.maMon}</td>
                    <td>{lop.tenMon}</td>
                    <td>{lop.tenLop}</td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {lop.tkbFormatted}
                    </td>
                    <td>
                      <button
                        className="btn__chung"
                        style={{
                          padding: "5px 10px",
                          fontSize: "12px",
                          marginRight: "5px",
                        }}
                        onClick={() => handleOpenChuyenLopModal(lop)}
                        disabled={submitting || chuyenLopLoading}
                      >
                        Chuyển lớp
                      </button>
                      <button
                        className="btn__cancel"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        onClick={() => handleHuyDangKySingle(lop.lopId)}
                        disabled={submitting}
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn__cancel mb_10"
              onClick={handleHuyDangKy}
              disabled={submitting || selectedToCancelIds.length === 0}
            >
              {submitting
                ? "Đang xử lý..."
                : `Hủy đăng ký (${selectedToCancelIds.length})`}
            </button>
          </div>
        </fieldset>
      </div>

      {/* Modal */}
      {selectedMonHoc && (
        <DangKyLopModal
          monHoc={selectedMonHoc}
          onClose={handleCloseModal}
          onDangKy={handleDangKyLop}
          isDaDangKy={isDaDangKyLop} // ✅ Pass function check lớp cụ thể
        />
      )}

      {/* ✅ Modal Chuyển lớp */}
      {chuyenLopModalData && (
        <ChuyenLopModal
          lopCu={chuyenLopModalData.lopCu}
          danhSachLopMoi={lopChuaDangKy}
          loading={loadingLopChuaDK}
          onClose={() => setChuyenLopModalData(null)}
          onChuyenLop={handleChuyenLop}
        />
      )}
    </section>
  );
}
