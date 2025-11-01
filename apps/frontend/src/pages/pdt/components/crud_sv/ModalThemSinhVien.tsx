import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../../hook/ModalContext";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type Khoa = { id: string; tenKhoa: string }; // ✅ Change from ten_khoa to tenKhoa
type Nganh = { id: string; tenNganh: string; khoaId: string }; // ✅ Change from ten_nganh & khoa_id

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

export const ModalThemSinhVien: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { openNotify } = useModalContext();

  const [danhSachKhoa, setDanhSachKhoa] = useState<Khoa[]>([]);
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);

  const [formData, setFormData] = useState({
    ma_so_sinh_vien: "",
    ho_ten: "",
    ten_dang_nhap: "",
    mat_khau: "",
    lop: "",
    khoa_id: "",
    nganh_id: "",
    khoa_hoc: "",
    ngay_nhap_hoc: "",
  });

  // Excel file state
  const [excelFile, setExcelFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        console.log("🔍 [Modal] Loading Khoa & Nganh...");

        const [khoaRes, nganhRes] = await Promise.all([
          fetch(`${API}/pdt/khoa`, withToken()),
          fetch(`${API}/dm/nganh`, withToken()),
        ]);

        const kjson = await khoaRes.json();
        const njson = await nganhRes.json();

        console.log("📦 [Modal] Khoa response:", kjson);
        console.log("📦 [Modal] Nganh response:", njson);

        // ✅ Handle multiple nested formats
        const khoaData =
          kjson?.data?.items || // { data: { items: [...] } }
          kjson?.data || // { data: [...] }
          kjson?.items || // { items: [...] }
          kjson || // Direct array
          [];

        const nganhData =
          njson?.data?.items || njson?.data || njson?.items || njson || [];

        console.log("✅ [Modal] Parsed Khoa:", khoaData);
        console.log("✅ [Modal] Parsed Nganh:", nganhData);

        // ✅ Validate array before setState
        setDanhSachKhoa(Array.isArray(khoaData) ? khoaData : []);
        setDanhSachNganh(Array.isArray(nganhData) ? nganhData : []);

        // ✅ Debug final state
        console.log(
          "✅ [Modal] Khoa count:",
          Array.isArray(khoaData) ? khoaData.length : 0
        );
        console.log(
          "✅ [Modal] Nganh count:",
          Array.isArray(nganhData) ? nganhData.length : 0
        );
      } catch (error) {
        console.error("❌ [Modal] Error loading data:", error);
        openNotify?.("Không thể tải danh sách Khoa/Ngành", "error");
      }
    })();
  }, [isOpen, openNotify]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async () => {
    // Mặc định username/password = MSSV nếu bỏ trống
    const ten_dang_nhap =
      formData.ten_dang_nhap || formData.ma_so_sinh_vien || "";
    const mat_khau = formData.mat_khau || formData.ma_so_sinh_vien || "";

    // Validate tối thiểu
    if (
      !formData.ma_so_sinh_vien ||
      !formData.ho_ten ||
      !ten_dang_nhap ||
      !mat_khau ||
      !formData.khoa_id
    ) {
      openNotify?.(
        "Vui lòng nhập đủ MSSV, Họ tên, Khoa (tên đăng nhập/mật khẩu mặc định = MSSV nếu bỏ trống)",
        "warning"
      );
      return;
    }

    const payload = {
      ten_dang_nhap,
      mat_khau,
      ho_ten: formData.ho_ten,
      ma_so_sinh_vien: formData.ma_so_sinh_vien,
      khoa_id: formData.khoa_id,
      lop: formData.lop || undefined,
      khoa_hoc: formData.khoa_hoc || undefined,
      ngay_nhap_hoc: formData.ngay_nhap_hoc || undefined,
      nganh_id: formData.nganh_id || undefined,
      trang_thai_hoat_dong: true,
    };

    try {
      const res = await fetch(
        `${API}/pdt/sinh-vien`,
        withToken({ method: "POST", body: JSON.stringify(payload) })
      );
      const json = await res.json();
      if (json.success || json.isSuccess) {
        openNotify?.("Thêm sinh viên thành công", "success");
        onCreated?.();
      } else {
        openNotify?.(json.message || "Thêm sinh viên thất bại", "error");
      }
    } catch {
      openNotify?.("Không thể gọi API", "error");
    }
  };

  // ============= IMPORT EXCEL (API: POST /api/import/sinh-vien) =============
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setExcelFile(f);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      openNotify?.("Vui lòng chọn file Excel (.xls, .xlsx)", "info");
      return;
    }
    try {
      const form = new FormData();
      form.append("file", excelFile);

      const res = await fetch(`${API}/import/sinh-vien`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: form,
      });

      const json = await res.json();
      if (!json.isSuccess) {
        openNotify?.(json.message || "Import thất bại", "error");
        return;
      }

      const summary = json.data?.summary;
      const results = json.data?.results || [];
      const created = summary?.created ?? 0;
      const failed = summary?.failed ?? 0;

      const firstErrors = results
        .filter((r: any) => r.status === "failed")
        .slice(0, 5)
        .map((r: any) => `Dòng ${r.row}: ${r.error}`)
        .join("\n");

      openNotify?.(
        `Import hoàn tất.\nTạo mới: ${created}\nLỗi: ${failed}${
          failed ? `\n${firstErrors}${results.length > 5 ? "\n..." : ""}` : ""
        }`,
        failed ? "warning" : "success"
      );

      setExcelFile(null);
      // FIX TS2779: không dùng optional chaining ở vế trái
      const el = document.getElementById(
        "excelUpload"
      ) as HTMLInputElement | null;
      if (el) el.value = "";

      onCreated?.();
    } catch {
      openNotify?.("Không thể gọi API import", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-popup">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="modal-header">
              <h1>Thêm sinh viên</h1>
              <button type="button" className="md-btn-cancel" onClick={onClose}>
                X
              </button>
            </div>

            {/* MSSV & Tên */}
            <div className="modal-popup-row">
              <div className="form__group ">
                <label className="pos__unset">Mã số sinh viên</label>
                <input
                  name="ma_so_sinh_vien"
                  type="text"
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Tên sinh viên</label>
                <input name="ho_ten" type="text" onChange={handleChange} />
              </div>
            </div>

            {/* Tài khoản */}
            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">
                  Tên đăng nhập <small>(mặc định = MSSV nếu bỏ trống)</small>
                </label>
                <input
                  name="ten_dang_nhap"
                  type="text"
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">
                  Mật khẩu <small>(mặc định = MSSV nếu bỏ trống)</small>
                </label>
                <input
                  name="mat_khau"
                  type="password"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Lớp - Khoa */}
            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Lớp</label>
                <input name="lop" type="text" onChange={handleChange} />
              </div>
              {/* Khoa dropdown */}
              <div className="form__group">
                <label className="pos__unset">Khoa</label>
                <select
                  id="md-Khoa"
                  name="khoa_id"
                  value={formData.khoa_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn khoa --</option>
                  {danhSachKhoa.map((khoa) => (
                    <option key={khoa.id} value={khoa.id}>
                      {khoa.tenKhoa} {/* ✅ Change from ten_khoa */}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ngành - Khóa học */}
            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Ngành</label>
                <select
                  id="md-Nganh"
                  name="nganh_id"
                  value={formData.nganh_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn ngành --</option>
                  {danhSachNganh
                    .filter(
                      (n) => !formData.khoa_id || n.khoaId === formData.khoa_id // ✅ Change from khoa_id
                    )
                    .map((nganh) => (
                      <option key={nganh.id} value={nganh.id}>
                        {nganh.tenNganh} {/* ✅ Change from ten_nganh */}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form__group">
                <label className="pos__unset">Khóa học</label>
                <input name="khoa_hoc" type="text" onChange={handleChange} />
              </div>
            </div>

            {/* Ngày nhập học & Excel */}
            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Ngày nhập học</label>
                <input
                  name="ngay_nhap_hoc"
                  type="date"
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Tải lên file Excel:</label>
                <input
                  id="excelUpload"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Nút */}
            <div className="modal-popup-row">
              <button
                type="button"
                className="md-btn-add"
                onClick={handleSubmit}
              >
                Thêm thủ công
              </button>
              <button
                type="button"
                className="md-btn-add"
                onClick={handleUploadExcel}
              >
                Tải từ Excel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalThemSinhVien;
