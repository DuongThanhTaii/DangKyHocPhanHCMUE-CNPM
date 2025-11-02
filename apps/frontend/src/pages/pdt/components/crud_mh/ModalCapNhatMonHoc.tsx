// ModalCapNhatMonHoc.tsx
import React, { useEffect, useMemo, useState } from "react";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";
import { useModalContext } from "../../../../hook/ModalContext";

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
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  khoa_id: string;
  loai_mon?: string | null;
  la_mon_chung?: boolean | null;
  thu_tu_hoc?: number | null;
  khoa?: { id: string; ten_khoa: string } | null;
  mon_hoc_nganh?: {
    nganh_id: string;
    nganh_hoc: { id: string; ten_nganh: string };
  }[];
  mon_dieu_kien_mon_dieu_kien_mon_hoc_idTomon_hoc?: {
    id: string;
    loai: string;
    bat_buoc: boolean;
    mon_lien_quan_id: string;
    mon_hoc_mon_dieu_kien_mon_lien_quan_idTomon_hoc: {
      id: string;
      ma_mon: string;
      ten_mon: string;
    };
  }[];
};

type Khoa = { id: string; ten_khoa: string };
type Nganh = { id: string; ten_nganh: string; khoa_id: string };
type MonHocOption = { id: string; ma_mon: string; ten_mon: string };

const ModalCapNhatMonHoc: React.FC<PropsEdit> = ({ id, isOpen, onClose }) => {
  const { openNotify } = useModalContext();

  const [khoaList, setKhoaList] = useState<Khoa[]>([]);
  const [nganhList, setNganhList] = useState<Nganh[]>([]);
  const [allMonHoc, setAllMonHoc] = useState<MonHocOption[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);

  const [form, setForm] = useState({
    ma_mon: "",
    ten_mon: "",
    so_tin_chi: "",
    khoa_id: "",
    loai_mon: "",
    la_mon_chung: "false",
    thu_tu_hoc: "1",
    nganh_ids: [] as string[] | null,
  });

  const [dkList, setDkList] = useState<
    { mon_lien_quan_id: string; loai: string; bat_buoc: boolean }[] | null
  >(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [dRes, kRes, nRes, mRes] = await Promise.all([
          fetch(`${API3}/pdt/mon-hoc/${id}`, withToken3()),
          fetch(`${API3}/dm/khoa`, withToken3()),
          fetch(`${API3}/dm/nganh`, withToken3()),
          fetch(`${API3}/pdt/mon-hoc?page=1&pageSize=10000`, withToken3()),
        ]);
        const [djson, kjson, njson, mjson] = [
          await dRes.json(),
          await kRes.json(),
          await nRes.json(),
          await mRes.json(),
        ];

        if (djson.isSuccess) {
          const d: Detail = djson.data;
          setDetail(d);
          setForm({
            ma_mon: d.ma_mon,
            ten_mon: d.ten_mon,
            so_tin_chi: String(d.so_tin_chi),
            khoa_id: d.khoa_id,
            loai_mon: d.loai_mon || "",
            la_mon_chung: d.la_mon_chung ? "true" : "false",
            thu_tu_hoc: String(d.thu_tu_hoc ?? 1),
            nganh_ids: d.mon_hoc_nganh?.map((x) => x.nganh_id) ?? [],
          });
          setDkList(
            (d.mon_dieu_kien_mon_dieu_kien_mon_hoc_idTomon_hoc || []).map(
              (x) => ({
                mon_lien_quan_id: x.mon_lien_quan_id,
                loai: x.loai,
                bat_buoc: x.bat_buoc,
              })
            )
          );
        } else {
          openNotify?.("Không tải được dữ liệu môn học", "error");
        }

        setKhoaList(kjson?.data || []);
        setNganhList(njson?.data || []);
        setAllMonHoc(
          (mjson?.data?.items || []).map((x: any) => ({
            id: x.id,
            ma_mon: x.ma_mon,
            ten_mon: x.ten_mon,
          }))
        );
      } catch {
        openNotify?.("Lỗi khi tải dữ liệu", "error");
      }
    })();
  }, [id, isOpen, openNotify]);

  const nganhTheoKhoa = useMemo(
    () => nganhList.filter((n) => !form.khoa_id || n.khoa_id === form.khoa_id),
    [nganhList, form.khoa_id]
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleNganh = (nganhId: string) => {
    setForm((s) => {
      const arr = s.nganh_ids || [];
      return {
        ...s,
        nganh_ids: arr.includes(nganhId)
          ? arr.filter((x) => x !== nganhId)
          : [...arr, nganhId],
      };
    });
  };

  const addDk = () =>
    setDkList((s) => [
      ...(s || []),
      { mon_lien_quan_id: "", loai: "tien_quyet", bat_buoc: true },
    ]);
  const rmDk = (idx: number) =>
    setDkList((s) => (s ? s.filter((_, i) => i !== idx) : s));
  const updateDk = (
    idx: number,
    patch: Partial<{
      mon_lien_quan_id: string;
      loai: string;
      bat_buoc: boolean;
    }>
  ) =>
    setDkList((s) =>
      s ? s.map((row, i) => (i === idx ? { ...row, ...patch } : row)) : s
    );

  const onSave = async () => {
    const payload: any = {
      ma_mon: form.ma_mon || undefined, // nếu cho phép đổi mã
      ten_mon: form.ten_mon || undefined,
      so_tin_chi: form.so_tin_chi ? Number(form.so_tin_chi) : undefined,
      khoa_id: form.khoa_id || undefined,
      loai_mon: form.loai_mon || undefined,
      la_mon_chung: form.la_mon_chung
        ? form.la_mon_chung === "true"
        : undefined,
      thu_tu_hoc: form.thu_tu_hoc ? Number(form.thu_tu_hoc) : undefined,
      nganh_ids: form.nganh_ids ?? null, // null: không đụng; []: xoá hết
      dieu_kien: dkList ?? null, // null: không đụng; []: xoá hết
    };

    try {
      const res = await fetch(
        `${API3}/pdt/mon-hoc/${id}`,
        withToken3({ method: "PUT", body: JSON.stringify(payload) })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Cập nhật môn học thành công", "success");
        onClose();
      } else openNotify?.(json.message || "Cập nhật thất bại", "error");
    } catch {
      openNotify?.("Không thể gọi API", "error");
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
          <div className="modal-header">
            <h1>Chỉnh sửa môn học</h1>
            <button type="button" className="md-btn-cancel" onClick={onClose}>
              X
            </button>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Mã môn</label>
              <input name="ma_mon" value={form.ma_mon} onChange={onChange} />
            </div>
            <div className="form__group">
              <label className="pos__unset">Tên môn</label>
              <input name="ten_mon" value={form.ten_mon} onChange={onChange} />
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Số tín chỉ</label>
              <input
                name="so_tin_chi"
                type="number"
                min={1}
                value={form.so_tin_chi}
                onChange={onChange}
              />
            </div>
            <div className="form__group">
              <label className="pos__unset">Thứ tự học</label>
              <input
                name="thu_tu_hoc"
                type="number"
                min={1}
                value={form.thu_tu_hoc}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Khoa</label>
              <select
                id="md-Nganh"
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
            <div className="form__group">
              <label className="pos__unset">Loại môn</label>
              <select
                id="md-Nganh"
                name="loai_mon"
                value={form.loai_mon}
                onChange={onChange}
              >
                <option value="">-- Chọn --</option>
                <option value="chuyen_nganh">Chuyên ngành</option>
                <option value="dai_cuong">Đại cương</option>
                <option value="tu_chon">Tự chọn</option>
              </select>
            </div>
          </div>

          <div className="modal-popup-row">
            <div className="form__group">
              <label className="pos__unset">Là môn chung?</label>
              <select
                id="md-Nganh"
                name="la_mon_chung"
                value={form.la_mon_chung}
                onChange={onChange}
              >
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </div>
          </div>

          {/* Gán ngành */}
          <div className="modal-popup-row">
            <div className="crud_nganh">
              <label className="pos__unset">Ngành áp dụng</label>
              <div className="crud_nganh-list">
                {nganhTheoKhoa.map((n) => (
                  <label className="pos__unset">
                    <input
                      type="checkbox"
                      checked={Boolean(form.nganh_ids?.includes(n.id))}
                      onChange={() => toggleNganh(n.id)}
                    />
                    <span>{n.ten_nganh}</span>
                  </label>
                ))}
                {nganhTheoKhoa.length === 0 && (
                  <i>Chọn Khoa để hiện danh sách ngành…</i>
                )}
              </div>
            </div>
          </div>

          {/* Môn điều kiện */}
          <div className="modal-popup-row">
            <div className="crud_nganh">
              <label className="pos__unset">Môn điều kiện</label>
              <button
                type="button"
                className="btn__chung mb_10"
                onClick={() => addDk()}
              >
                + Thêm điều kiện
              </button>
              <div className="crud_nganh-list">
                {(dkList || []).map((dk, idx) => (
                  <div key={idx} className="flex_col">
                    <select
                      className="crud_monhoc_dk"
                      value={dk.mon_lien_quan_id}
                      onChange={(e) =>
                        updateDk(idx, { mon_lien_quan_id: e.target.value })
                      }
                    >
                      <option value="">-- Chọn môn --</option>
                      {allMonHoc.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.ma_mon} — {m.ten_mon}
                        </option>
                      ))}
                    </select>
                    <select
                      className="crud_monhoc_dk"
                      value={dk.loai}
                      onChange={(e) => updateDk(idx, { loai: e.target.value })}
                    >
                      <option value="tien_quyet">Tiên quyết</option>
                      <option value="song_hanh">Song hành</option>
                    </select>
                    <select
                      className="crud_monhoc_dk"
                      value={dk.bat_buoc ? "true" : "false"}
                      onChange={(e) =>
                        updateDk(idx, { bat_buoc: e.target.value === "true" })
                      }
                    >
                      <option value="true">Bắt buộc</option>
                      <option value="false">Không bắt buộc</option>
                    </select>
                    <button
                      type="button"
                      className="btn__cancel h__30"
                      onClick={() => rmDk(idx)}
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
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

export default ModalCapNhatMonHoc;
