// src/features/tao-lop-hoc-phan/TaoLopHocPhan.tsx
import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";
import { useHocKyNienKhoa } from "../../features/pdt/hooks";
import {
  useHocPhansForCreateLop,
  useHocKyHienHanhTLK,
} from "../../features/tlk/hooks"; // ✅ Import hook mới
import { HocKyNienKhoaShowSetup } from "../pdt/components/HocKyNienKhoaShowSetup";
import DanhSachHocPhanTaoLop from "./tao-lop-hoc-phan/DanhSachHocPhanTaoLop";
import TaoThoiKhoaBieuModal from "./tao-lop-hoc-phan/TaoThoiKhoaBieuModal";

type SelectedConfig = {
  soLuongLop: string;
  tietBatDau: string;
  tietKetThuc: string;
  soTietMoiBuoi: string;
  tongSoTiet: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayHoc: string[];
  phongHoc: string;
};

export default function TaoLopHocPhan() {
  const { openNotify } = useModalContext();

  // ========= Hooks =========
  const {
    data: hocKyNienKhoas,
    loading: loadingSemesters,
    error: errorSemesters,
  } = useHocKyNienKhoa();

  const {
    data: hocPhans,
    loading: loadingHocPhans,
    fetchData,
  } = useHocPhansForCreateLop();

  const {
    hocKyHienHanh,
    loading: loadingHocKy,
    error: errorHocKy,
  } = useHocKyHienHanhTLK();

  // ========= States =========
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtered, setFiltered] = useState(hocPhans);
  const [selected, setSelected] = useState<Record<string, SelectedConfig>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;
  const [showTKBModal, setShowTKBModal] = useState(false);

  // ✅ Merge tất cả auto-select logic vào 1 useEffect duy nhất
  useEffect(() => {
    // ✅ 1. Auto-select học kỳ hiện hành (ưu tiên cao nhất)
    if (hocKyHienHanh?.hoc_ky_id && hocKyNienKhoas.length > 0) {
      // Tìm niên khóa chứa học kỳ hiện hành
      for (const nk of hocKyNienKhoas) {
        const foundHK = nk.hocKy.find(
          (hk) => hk.id === hocKyHienHanh.hoc_ky_id
        );
        if (foundHK) {
          setSelectedNienKhoa(nk.id);
          setSelectedHocKyId(foundHK.id);
          return; // ✅ Exit early
        }
      }
    }

    // ✅ 2. Fallback: Auto-select first niên khóa nếu chưa có selection
    if (hocKyNienKhoas.length > 0 && !selectedNienKhoa) {
      const firstNK = hocKyNienKhoas[0];
      setSelectedNienKhoa(firstNK.id);
      if (firstNK.hocKy.length > 0) {
        setSelectedHocKyId(firstNK.hocKy[0].id);
      }
    }
  }, [hocKyNienKhoas, hocKyHienHanh, selectedNienKhoa]); // ✅ Chỉ re-run khi dependencies thay đổi

  // ✅ Fetch data khi học kỳ thay đổi (separate effect)
  useEffect(() => {
    if (selectedHocKyId) {
      fetchData(selectedHocKyId);
    }
  }, [selectedHocKyId, fetchData]);

  // ========= Filter data =========
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(hocPhans);
    } else {
      const q = searchQuery.trim().toLowerCase();
      setFiltered(
        hocPhans.filter(
          (i) =>
            i.maHocPhan?.toLowerCase().includes(q) ||
            i.tenHocPhan?.toLowerCase().includes(q) ||
            String(i.soTinChi ?? "").includes(q) ||
            i.tenGiangVien?.toLowerCase().includes(q)
        )
      );
    }
    setCurrentPage(1);
  }, [searchQuery, hocPhans]);

  // ✅ Tính toán paging trước
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ✅ Lấy giangVienId từ học phần được chọn trong modal
  const giangVienId = useMemo(() => {
    // Lấy từ học phần đầu tiên trong currentData (trang hiện tại)
    if (currentData.length > 0) {
      return currentData[0]?.giangVienId;
    }
    return undefined;
  }, [currentData]);

  console.log("🔍 [TaoLopHocPhan] currentData:", currentData);
  console.log("🔍 [TaoLopHocPhan] giangVienId:", giangVienId);

  const currentNK = hocKyNienKhoas.find((nk) => nk.id === selectedNienKhoa);
  const currentHK = currentNK?.hocKy.find((hk) => hk.id === selectedHocKyId);

  const currentSemester = {
    ten_hoc_ky: currentHK?.tenHocKy || null,
    ten_nien_khoa: currentNK?.tenNienKhoa || null,
    ngay_bat_dau: currentHK?.ngayBatDau
      ? new Date(currentHK.ngayBatDau).toISOString().split("T")[0]
      : null,
    ngay_ket_thuc: currentHK?.ngayKetThuc
      ? new Date(currentHK.ngayKetThuc).toISOString().split("T")[0]
      : null,
  };

  // ========= Handlers =========
  const handleChangeNienKhoa = (nienKhoaId: string) => {
    setSelectedNienKhoa(nienKhoaId);
    const nk = hocKyNienKhoas.find((x) => x.id === nienKhoaId);
    if (nk?.hocKy.length) {
      setSelectedHocKyId(nk.hocKy[0].id);
    } else {
      setSelectedHocKyId("");
    }
  };

  const handleCheck = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          soLuongLop: "",
          tietBatDau: "",
          tietKetThuc: "",
          soTietMoiBuoi: "",
          tongSoTiet: "",
          ngayBatDau: "",
          ngayKetThuc: "",
          ngayHoc: [],
          phongHoc: "",
        };
      }
      return next;
    });
  };

  const handleChange = (
    id: string,
    field: keyof SelectedConfig,
    value: any
  ) => {
    setSelected((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          soLuongLop: "",
          tietBatDau: "",
          tietKetThuc: "",
          soTietMoiBuoi: "",
          tongSoTiet: "",
          ngayBatDau: "",
          ngayKetThuc: "",
          ngayHoc: [],
          phongHoc: "",
        }),
        [field]: value,
      },
    }));
  };

  const validateConfig = (cfg: SelectedConfig) => {
    if (!cfg.soLuongLop || Number(cfg.soLuongLop) <= 0)
      return "Số lớp phải > 0";
    if (!cfg.tietBatDau || !cfg.tietKetThuc)
      return "Thiếu tiết bắt đầu/kết thúc";
    if (Number(cfg.tietKetThuc) < Number(cfg.tietBatDau))
      return "Tiết kết thúc phải >= tiết bắt đầu";
    if (!cfg.ngayBatDau || !cfg.ngayKetThuc)
      return "Thiếu ngày bắt đầu/kết thúc";
    if (new Date(cfg.ngayKetThuc) < new Date(cfg.ngayBatDau))
      return "Ngày kết thúc phải >= ngày bắt đầu";
    if (!cfg.ngayHoc?.length) return "Chưa chọn ngày học";
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedHocKyId) {
      openNotify({ message: "Vui lòng chọn Học kỳ", type: "warning" });
      return;
    }

    const entries = Object.entries(selected);
    if (entries.length === 0) {
      openNotify({ message: "Chưa chọn học phần nào", type: "warning" });
      return;
    }

    for (const [hocPhanId, cfg] of entries) {
      const msg = validateConfig(cfg);
      if (msg) {
        const row = hocPhans.find((hp) => hp.id === hocPhanId);
        openNotify({
          message: `HP ${row?.maHocPhan || hocPhanId}: ${msg}`,
          type: "warning",
        });
        return;
      }
    }

    const danhSachLop = entries.map(([hocPhanId, data]) => ({
      hocPhanId,
      ...data,
    }));

    try {
      await fetchJSON("/api/pdt/tao-lop-hoc-phan", {
        method: "POST",
        body: { danhSachLop },
      });
      setSelected({});
      fetchData(selectedHocKyId);
      openNotify({
        message: `Tạo ${danhSachLop.length} lớp thành công`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
      openNotify({ message: "Tạo lớp thất bại", type: "error" });
    }
  };

  const handleTKBSuccess = () => {
    if (selectedHocKyId) {
      fetchData(selectedHocKyId);
    }
  };

  // ========= Loading & Error States (ĐẶT SAU TẤT CẢ HOOKS) =========
  if (loadingSemesters || loadingHocKy) return <p>Đang tải dữ liệu...</p>;
  if (errorSemesters) return <p>{errorSemesters}</p>;
  if (errorHocKy) return <p>{errorHocKy}</p>;
  if (!hocKyHienHanh) return <p>Không tìm thấy học kỳ hiện hành</p>;

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TẠO LỚP HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        <HocKyNienKhoaShowSetup
          hocKyNienKhoas={hocKyNienKhoas}
          loadingHocKy={loadingSemesters}
          submitting={false}
          selectedNienKhoa={selectedNienKhoa}
          selectedHocKy={selectedHocKyId}
          semesterStart=""
          semesterEnd=""
          currentSemester={currentSemester}
          semesterMessage=""
          onChangeNienKhoa={handleChangeNienKhoa}
          onChangeHocKy={setSelectedHocKyId}
          onChangeStart={() => {}}
          onChangeEnd={() => {}}
          onSubmit={(e) => e.preventDefault()}
        />

        <div className="form__group__tracuu mt_20">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form__input"
            style={{ width: "100%" }}
          />
        </div>

        {loadingHocPhans ? (
          <p>Đang tải học phần...</p>
        ) : (
          <>
            <DanhSachHocPhanTaoLop
              data={currentData}
              selected={selected}
              onCheck={handleCheck}
              onChange={handleChange}
            />

            <div style={{ marginTop: "1rem" }}>
              <button
                className="btn__chung P__10__20"
                onClick={() => setShowTKBModal(true)}
                disabled={!selectedHocKyId} // ✅ Disable nếu chưa chọn học kỳ
              >
                Tạo Thời Khóa Biểu
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: "0 4px",
              padding: "3px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: currentPage === i + 1 ? "#0c4874" : "#fff",
              color: currentPage === i + 1 ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ✅ Truyền giangVienId vào modal */}
      {showTKBModal && selectedHocKyId && (
        <TaoThoiKhoaBieuModal
          danhSachLop={currentData}
          hocKyId={selectedHocKyId}
          giangVienId={giangVienId} // ✅ Truyền giangVienId
          onClose={() => setShowTKBModal(false)}
          onSuccess={handleTKBSuccess}
        />
      )}
    </section>
  );
}
