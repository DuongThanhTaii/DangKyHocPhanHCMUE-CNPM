import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../hook/ModalContext";
import "../../../styles/reset.css";
import "../../../styles/menu.css";

type Props = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
};

type Detail = {
  id: string;
  ma_so_sinh_vien: string;
  lop?: string | null;
  khoa_hoc?: string | null;
  users: { ho_ten: string; tai_khoan?: { ten_dang_nhap: string } | null };
  khoa?: { id: string; ten_khoa: string } | null;
  nganh_hoc?: { id: string; ten_nganh: string } | null;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

const ModalCapNhatSinhVien: React.FC<Props> = ({ id, isOpen, onClose }) => {
  const { openNotify } = useModalContext();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState({
    ho_ten: "",
    ma_so_sinh_vien: "",
    lop: "",
    khoa_hoc: "",
    mat_khau: "", // optional: nếu nhập sẽ đổi
  });

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const res = await fetch(`${API}/pdt/sinh-vien/${id}`, withToken());
      const json = await res.json();
      if (json.success || json.isSuccess) {
        const d = (json.data || json)?.data || json;
        setDetail(d);
        setForm({
          ho_ten: d?.users?.ho_ten || "",
          ma_so_sinh_vien: d?.ma_so_sinh_vien || "",
          lop: d?.lop || "",
          khoa_hoc: d?.khoa_hoc || "",
          mat_khau: "",
        });
      } else {
        openNotify?.(json.message || "Không tải được chi tiết", "error");
      }
    })();
  }, [id, isOpen, openNotify]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSave = async () => {
    const payload: any = {
      ho_ten: form.ho_ten || undefined,
      ma_so_sinh_vien: form.ma_so_sinh_vien || undefined,
      lop: form.lop || undefined,
      khoa_hoc: form.khoa_hoc || undefined,
    };
    if (form.mat_khau) payload.mat_khau = form.mat_khau;

    const res = await fetch(
      `${API}/pdt/sinh-vien/${id}`,
      withToken({ method: "PUT", body: JSON.stringify(payload) })
    );
    const json = await res.json();
    if (json.success || json.isSuccess) {
      openNotify?.("Cập nhật thành công", "success");
      onClose();
    } else {
      openNotify?.(json.message || "Cập nhật thất bại", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-popup">
        <div className="modal-header">
          <h1>Chỉnh sửa sinh viên</h1>
          <button type="button" className="md-btn-cancel" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-popup-row">
          <div className="form__group">
            <label>MSSV</label>
            <input
              name="ma_so_sinh_vien"
              value={form.ma_so_sinh_vien}
              onChange={onChange}
            />
          </div>
          <div className="form__group">
            <label>Họ tên</label>
            <input name="ho_ten" value={form.ho_ten} onChange={onChange} />
          </div>
        </div>

        <div className="modal-popup-row">
          <div className="form__group">
            <label>Lớp</label>
            <input name="lop" value={form.lop} onChange={onChange} />
          </div>
          <div className="form__group">
            <label>Niên khóa</label>
            <input name="khoa_hoc" value={form.khoa_hoc} onChange={onChange} />
          </div>
        </div>

        <div className="modal-popup-row">
          <div className="form__group">
            <label>Mật khẩu (đổi nếu nhập)</label>
            <input
              name="mat_khau"
              type="password"
              value={form.mat_khau}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="modal-popup-row">
          <button className="md-btn-add" onClick={onSave}>
            Lưu
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalCapNhatSinhVien;
