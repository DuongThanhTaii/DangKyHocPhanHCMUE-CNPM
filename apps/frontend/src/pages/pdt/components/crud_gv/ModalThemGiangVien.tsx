import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../../hook/ModalContext";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";

const API2 = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken2 = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

type PropsAdd = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type Khoa = { id: string; ten_khoa: string };

const ModalThemGiangVien: React.FC<PropsAdd> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { openNotify } = useModalContext();

  const [danhSachKhoa, setDanhSachKhoa] = useState<Khoa[]>([]);
  const [form, setForm] = useState({
    ten_dang_nhap: "",
    mat_khau: "",
    ho_ten: "",
    khoa_id: "",
    trinh_do: "",
    chuyen_mon: "",
    kinh_nghiem_giang_day: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await fetch(`${API2}/dm/khoa`, withToken2());
        const json = await res.json();
        setDanhSachKhoa(json?.data || []);
      } catch {
        // có thể bỏ qua, không cần notify
      }
    })();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.ten_dang_nhap ||
      !form.mat_khau ||
      !form.ho_ten ||
      !form.khoa_id
    ) {
      openNotify?.(
        "Vui lòng nhập đủ Tên đăng nhập, Mật khẩu, Họ tên, Khoa",
        "warning"
      );
      return;
    }

    const payload = {
      ten_dang_nhap: form.ten_dang_nhap,
      mat_khau: form.mat_khau,
      ho_ten: form.ho_ten,
      khoa_id: form.khoa_id,
      trinh_do: form.trinh_do || undefined,
      chuyen_mon: form.chuyen_mon || undefined,
      kinh_nghiem_giang_day: form.kinh_nghiem_giang_day
        ? Number(form.kinh_nghiem_giang_day)
        : undefined,
    };

    try {
      const res = await fetch(
        `${API2}/pdt/giang-vien`,
        withToken2({ method: "POST", body: JSON.stringify(payload) })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Thêm giảng viên thành công", "success");
        onCreated?.();
        onClose();
        // reset form (tuỳ chọn)
        setForm({
          ten_dang_nhap: "",
          mat_khau: "",
          ho_ten: "",
          khoa_id: "",
          trinh_do: "",
          chuyen_mon: "",
          kinh_nghiem_giang_day: "",
        });
      } else {
        openNotify?.(json.message || "Thêm thất bại", "error");
      }
    } catch {
      openNotify?.("Không thể gọi API", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-popup">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="modal-header">
              <h1>Thêm giảng viên</h1>
              <button type="button" className="md-btn-cancel" onClick={onClose}>
                X
              </button>
            </div>

            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Tên đăng nhập (MGV)</label>
                <input
                  name="ten_dang_nhap"
                  type="text"
                  value={form.ten_dang_nhap}
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Mật khẩu</label>
                <input
                  name="mat_khau"
                  type="password"
                  value={form.mat_khau}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Họ tên</label>
                <input
                  name="ho_ten"
                  type="text"
                  value={form.ho_ten}
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Khoa</label>
                <select
                  id="md-Khoa"
                  name="khoa_id"
                  value={form.khoa_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn khoa --</option>
                  {danhSachKhoa.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.ten_khoa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Trình độ</label>
                <input
                  name="trinh_do"
                  type="text"
                  value={form.trinh_do}
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Chuyên môn</label>
                <input
                  name="chuyen_mon"
                  type="text"
                  value={form.chuyen_mon}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">
                  Kinh nghiệm giảng dạy (năm)
                </label>
                <input
                  name="kinh_nghiem_giang_day"
                  type="number"
                  min={0}
                  value={form.kinh_nghiem_giang_day}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-popup-row">
              <button
                type="button"
                className="md-btn-add"
                onClick={handleSubmit}
              >
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalThemGiangVien;
