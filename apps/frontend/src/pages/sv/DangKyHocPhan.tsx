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

  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
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

  // ✅ ALL STATE HOOKS
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
  const [searchQuery, setSearchQuery] = useState<string>(""); // ✅ Move here

  // ✅ ALL HELPER FUNCTIONS
  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const isDaDangKyMonHoc = (maMon: string) => {
    return lopDaDangKy.some((mon) => mon.maMon === maMon);
  };

  const isDaDangKyLop = (lopId: string) => {
    return lopDaDangKy.some((mon) =>
      mon.danhSachLop.some((lop) => lop.id === lopId)
    );
  };

  // ✅ ALL USEMEMO HOOKS
  const sourceByTab = useMemo(
    () => ({
      monChung: lopHocPhanData?.monChung || [],
      batBuoc: lopHocPhanData?.batBuoc || [],
      tuChon: lopHocPhanData?.tuChon || [],
    }),
    [lopHocPhanData]
  );

  const filteredMonHoc = useMemo(() => {
    const src = sourceByTab[activeTab] as MonHocInfoDTO[];
    const q = norm(searchQuery.trim());
    if (!q) return src;
    return src.filter(
      (m) => norm(m.maMon).includes(q) || norm(m.tenMon).includes(q)
    );
  }, [sourceByTab, activeTab, searchQuery]);

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

  // ✅ ALL EVENT HANDLERS
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

  const handleOpenChuyenLopModal = async (lop: {
    lopId: string;
    maMon: string;
    tenMon: string;
    tenLop: string;
  }) => {
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
        monHocId: monHoc.maMon,
        maMon: lop.maMon,
        tenMon: lop.tenMon,
        tenLop: lop.tenLop,
      },
    });

    await fetchLopChuaDangKy(monHoc.maMon, hocKyId);
  };

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

  const handleHuyDangKySingle = async (lopId: string) => {
    const confirmed = await openConfirm({
      message: "Xác nhận hủy đăng ký lớp này?",
      confirmText: "Hủy đăng ký",
    });

    if (!confirmed) return;

    const result = await huyDangKy({
      lop_hoc_phan_id: lopId,
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
        lop_hoc_phan_id: lopId,
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      openNotify({ message: "Đã làm mới danh sách môn học", type: "info" });
      return;
    }
    const count = filteredMonHoc.length;
    if (count === 0) {
      openNotify({ message: "Không tìm thấy môn phù hợp", type: "warning" });
    } else {
      openNotify({ message: `Tìm thấy ${count} môn`, type: "info" });
    }
  };

  const renderMonHocTable = (danhSachMon: MonHocInfoDTO[]) => {
    return danhSachMon.map((mon: MonHocInfoDTO, index: number) => {
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

  // ✅ NOW SAFE TO DO EARLY RETURNS (all hooks already called)
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

        {/* Thanh tìm kiếm */}
        <form
          className="search-form search-form__gd"
          onSubmit={handleSearch}
          style={{ marginTop: 12 }}
        >
          <div className="form__group">
            <input
              type="text"
              placeholder="Tìm kiếm mã hoặc tên môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form__input h__40"
            />
          </div>
          <button type="submit" className="form__button w__140">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M500.7 138.7L512 149.4L512 96C512 78.3 526.3 64 544 64C561.7 64 576 78.3 576 96L576 224C576 241.7 561.7 256 544 256L416 256C398.3 256 384 241.7 384 224C384 206.3 398.3 192 416 192L463.9 192L456.3 184.8C380.7 109.2 259.2 109.2 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C238.9 39.1 400.7 39 500.7 138.7z"
              />
            </svg>
            Làm mới
          </button>
        </form>

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
