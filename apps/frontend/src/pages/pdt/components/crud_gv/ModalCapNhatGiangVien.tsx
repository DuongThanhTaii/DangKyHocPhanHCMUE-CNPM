// ModalCapNhatGiangVien.tsx
import React, { useEffect, useState } from "react";
import { useModalContext } from "../../../../hook/ModalContext";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";

const API3 = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken3 = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

type PropsEdit = { id: string; isOpen: boolean; onClose: () => void };

type Detail = {
  id: string;
  khoa_id: string;
  trinh_do?: string | null;
  chuyen_mon?: string | null;
  kinh_nghiem_giang_day?: number | null;
  users: { ho_ten: string; tai_khoan?: { ten_dang_nhap: string } | null };
  khoa?: { id: string; ten_khoa: string } | null;
};

type Khoa = { id: string; ten_khoa: string };

const ModalCapNhatGiangVien: React.FC<PropsEdit> = ({
  id,
  isOpen,
  onClose,
}) => {
  const { openNotify } = useModalContext();

  const [detail, setDetail] = useState<Detail | null>(null);
  const [khoaList, setKhoaList] = useState<Khoa[]>([]);

  const [form, setForm] = useState({
    ho_ten: "",
    mat_khau: "",
    khoa_id: "",
    trinh_do: "",
    chuyen_mon: "",
    kinh_nghiem_giang_day: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [detailRes, khoaRes] = await Promise.all([
          fetch(`${API3}/pdt/giang-vien/${id}`, withToken3()),
          fetch(`${API3}/dm/khoa`, withToken3()),
        ]);
        const djson = await detailRes.json();
        const kjson = await khoaRes.json();

        if (djson.isSuccess) {
          const d: Detail = djson.data;
          setDetail(d);
          setForm({
            ho_ten: d.users?.ho_ten || "",
            mat_khau: "",
            khoa_id: d.khoa_id || "",
            trinh_do: d.trinh_do || "",
            chuyen_mon: d.chuyen_mon || "",
            kinh_nghiem_giang_day: (d.kinh_nghiem_giang_day ?? "").toString(),
          });
        } else {
          openNotify?.("Không tải được dữ liệu giảng viên", "error");
        }
        setKhoaList(kjson?.data || []);
      } catch {
        openNotify?.("Lỗi khi tải dữ liệu", "error");
      }
    })();
  }, [id, isOpen, openNotify]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSave = async () => {
    const payload: any = {
      ho_ten: form.ho_ten || undefined,
      khoa_id: form.khoa_id || undefined,
      trinh_do: form.trinh_do || undefined,
      chuyen_mon: form.chuyen_mon || undefined,
      kinh_nghiem_giang_day:
        form.kinh_nghiem_giang_day !== ""
          ? Number(form.kinh_nghiem_giang_day)
          : undefined,
    };
    if (form.mat_khau) payload.mat_khau = form.mat_khau;

    try {
      const res = await fetch(
        `${API3}/pdt/giang-vien/${id}`,
        withToken3({ method: "PUT", body: JSON.stringify(payload) })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Cập nhật giảng viên thành công", "success");
        onClose();
      } else {
        openNotify?.(json.message || "Cập nhật thất bại", "error");
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
          <div className="modal-header">
            <h1>Chỉnh sửa giảng viên</h1>
            <button type="button" className="md-btn-cancel" onClick={onClose}>
              X
            </button>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Họ tên</label>
              <input name="ho_ten" value={form.ho_ten} onChange={onChange} />
            </div>
            <div className="form__group">
              <label className="pos__unset">Khoa</label>
              <select
                id="md-Khoa"
                name="khoa_id"
                value={form.khoa_id}
                onChange={onChange}
              >
                <option value="">-- Chọn khoa --</option>
                {khoaList.map((k) => (
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
                value={form.trinh_do}
                onChange={onChange}
              />
            </div>
            <div className="form__group">
              <label className="pos__unset">Chuyên môn</label>
              <input
                name="chuyen_mon"
                value={form.chuyen_mon}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Kinh nghiệm giảng dạy (năm)</label>
              <input
                name="kinh_nghiem_giang_day"
                type="number"
                min={0}
                value={form.kinh_nghiem_giang_day}
                onChange={onChange}
              />
            </div>
            <div className="form__group">
              <label className="pos__unset">Mật khẩu (đổi nếu nhập)</label>
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
      </div>
    </>
  );
};

export default ModalCapNhatGiangVien;
