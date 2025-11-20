import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../../hook/ModalContext";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";

type Props = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
};

// ✅ Update type to match API response (camelCase)
type Detail = {
  id: string;
  maSoSinhVien: string;
  hoTen: string;
  lop?: string | null;
  khoaHoc?: string | null;
  tenKhoa?: string | null;
  tenNganh?: string | null;
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
    hoTen: "",
    maSoSinhVien: "",
    lop: "",
    khoaHoc: "",
    matKhau: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const res = await fetch(`${API}/pdt/sinh-vien/${id}`, withToken());
      const json = await res.json();
      if (json.success || json.isSuccess) {
        const d = json.data || json;
        setDetail(d);
        setForm({
          hoTen: d.hoTen || "",
          maSoSinhVien: d.maSoSinhVien || "",
          lop: d.lop || "",
          khoaHoc: d.khoaHoc || "",
          matKhau: "",
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
    // ✅ Send camelCase payload (only changed fields)
    const payload: any = {};

    if (form.hoTen !== detail?.hoTen) payload.hoTen = form.hoTen;
    if (form.maSoSinhVien !== detail?.maSoSinhVien)
      payload.maSoSinhVien = form.maSoSinhVien;
    if (form.lop !== detail?.lop) payload.lop = form.lop;
    if (form.khoaHoc !== detail?.khoaHoc) payload.khoaHoc = form.khoaHoc;
    if (form.matKhau) payload.matKhau = form.matKhau;

    // ✅ Check if there are any changes
    if (Object.keys(payload).length === 0) {
      openNotify?.("Không có thay đổi nào", "info");
      return;
    }

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
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-popup" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h1>Chỉnh sửa sinh viên</h1>
            <button type="button" className="md-btn-cancel" onClick={onClose}>
              X
            </button>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">MSSV</label>
              <input
                name="maSoSinhVien"
                value={form.maSoSinhVien}
                onChange={onChange}
              />
            </div>
            <div className="form__group">
              <label className="pos__unset">Họ tên</label>
              <input name="hoTen" value={form.hoTen} onChange={onChange} />
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Lớp</label>
              <input name="lop" value={form.lop} onChange={onChange} />
            </div>
            <div className="form__group">
              <label className="pos__unset">Khóa học</label>
              <input name="khoaHoc" value={form.khoaHoc} onChange={onChange} />
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">
                Mật khẩu mới (bỏ trống nếu không đổi)
              </label>
              <input
                name="matKhau"
                type="password"
                value={form.matKhau}
                onChange={onChange}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          </div>

          {/* ✅ Display readonly info */}

          <div className="modal-popup-row">
            <button className="md-btn-add" onClick={onSave}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCapNhatSinhVien;
