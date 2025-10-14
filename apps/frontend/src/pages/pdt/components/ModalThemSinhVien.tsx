import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../hook/ModalContext";
import "../../../styles/reset.css";
import "../../../styles/menu.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type Khoa = { id: string; ten_khoa: string };
type Nganh = { id: string; ten_nganh: string; khoa_id: string };

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

const ModalThemSinhVien: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
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

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [khoaRes, nganhRes] = await Promise.all([
          fetch(`${API}/dm/khoa`, withToken()),
          fetch(`${API}/dm/nganh`, withToken()),
        ]);
        const kjson = await khoaRes.json();
        const njson = await nganhRes.json();
        setDanhSachKhoa(kjson?.data || kjson || []);
        setDanhSachNganh(njson?.data || njson || []);
      } catch {
        // ignore
      }
    })();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate đơn giản
    if (
      !formData.ma_so_sinh_vien ||
      !formData.ho_ten ||
      !formData.ten_dang_nhap ||
      !formData.mat_khau ||
      !formData.khoa_id
    ) {
      openNotify?.(
        "Vui lòng nhập đủ MSSV, Họ tên, Tên đăng nhập, Mật khẩu, Khoa",
        "warning"
      );
      return;
    }

    const payload = {
      ten_dang_nhap: formData.ten_dang_nhap,
      mat_khau: formData.mat_khau,
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
    } catch (e) {
      openNotify?.("Không thể gọi API", "error");
    }
  };

  // Tải Excel (tuỳ backend bạn có API batch hay chưa)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: parse XLSX hoặc gửi FormData đến API batch nếu bạn đã có
    // Để trống theo yêu cầu hiện tại
  };
  const handleUploadExcel = () => {
    openNotify?.(
      "Tính năng tải Excel sẽ được bổ sung khi có API batch",
      "info"
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
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
            <div className="form__group">
              <label>Mã số sinh viên</label>
              <input
                name="ma_so_sinh_vien"
                type="text"
                onChange={handleChange}
              />
            </div>
            <div className="form__group">
              <label>Tên sinh viên</label>
              <input name="ho_ten" type="text" onChange={handleChange} />
            </div>
          </div>

          {/* Tài khoản */}
          <div className="modal-popup-row">
            <div className="form__group">
              <label>Tên đăng nhập</label>
              <input name="ten_dang_nhap" type="text" onChange={handleChange} />
            </div>
            <div className="form__group">
              <label>Mật khẩu</label>
              <input name="mat_khau" type="password" onChange={handleChange} />
            </div>
          </div>

          {/* Lớp - Khoa */}
          <div className="modal-popup-row">
            <div className="form__group">
              <label>Lớp</label>
              <input name="lop" type="text" onChange={handleChange} />
            </div>
            <div className="form__group">
              <label>Khoa</label>
              <select
                id="md-Khoa"
                name="khoa_id"
                value={formData.khoa_id}
                onChange={handleChange}
              >
                <option value="">-- Chọn khoa --</option>
                {Array.isArray(danhSachKhoa) &&
                  danhSachKhoa.map((khoa) => (
                    <option key={khoa.id} value={khoa.id}>
                      {khoa.ten_khoa}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Ngành - Khóa học */}
          <div className="modal-popup-row">
            <div className="form__group">
              <label>Ngành</label>
              <select
                id="md-Nganh"
                name="nganh_id"
                value={formData.nganh_id}
                onChange={handleChange}
              >
                <option value="">-- Chọn ngành --</option>
                {danhSachNganh
                  .filter(
                    (n) => !formData.khoa_id || n.khoa_id === formData.khoa_id
                  )
                  .map((nganh) => (
                    <option key={nganh.id} value={nganh.id}>
                      {nganh.ten_nganh}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form__group">
              <label>Khóa học</label>
              <input name="khoa_hoc" type="text" onChange={handleChange} />
            </div>
          </div>

          {/* Ngày nhập học & Excel */}
          <div className="modal-popup-row">
            <div className="form__group">
              <label>Ngày nhập học</label>
              <input name="ngay_nhap_hoc" type="date" onChange={handleChange} />
            </div>
            <div className="form__group">
              <label>Tải lên file Excel:</label>
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
            <button type="button" className="md-btn-add" onClick={handleSubmit}>
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
    </>
  );
};

export default ModalThemSinhVien;
