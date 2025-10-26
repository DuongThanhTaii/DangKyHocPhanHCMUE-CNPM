// ModalThemMonHoc.tsx
import React, { useEffect, useMemo, useState } from "react";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";
import { useModalContext } from "../../../../hook/ModalContext";

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
type Nganh = { id: string; ten_nganh: string; khoa_id: string };
type MonHocOption = { id: string; ma_mon: string; ten_mon: string };

const ModalThemMonHoc: React.FC<PropsAdd> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { openNotify } = useModalContext();

  const [khoaList, setKhoaList] = useState<Khoa[]>([]);
  const [nganhList, setNganhList] = useState<Nganh[]>([]);
  const [allMonHoc, setAllMonHoc] = useState<MonHocOption[]>([]); // phục vụ chọn môn điều kiện

  const [form, setForm] = useState({
    ma_mon: "",
    ten_mon: "",
    so_tin_chi: "",
    khoa_id: "",
    loai_mon: "chuyen_nganh",
    la_mon_chung: "false",
    thu_tu_hoc: "1",
    nganh_ids: [] as string[],
  });

  const [dkList, setDkList] = useState<
    { mon_lien_quan_id: string; loai: string; bat_buoc: boolean }[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [khoaRes, nganhRes, monRes] = await Promise.all([
          fetch(`${API2}/dm/khoa`, withToken2()),
          fetch(`${API2}/dm/nganh`, withToken2()),
          fetch(`${API2}/pdt/mon-hoc?page=1&pageSize=10000`, withToken2()),
        ]);
        const [kjson, njson, mjson] = [
          await khoaRes.json(),
          await nganhRes.json(),
          await monRes.json(),
        ];
        setKhoaList(kjson?.data || []);
        setNganhList(njson?.data || []);
        const options = (mjson?.data?.items || []).map((x: any) => ({
          id: x.id,
          ma_mon: x.ma_mon,
          ten_mon: x.ten_mon,
        }));
        setAllMonHoc(options);
      } catch {
        openNotify?.("Không thể tải danh mục Khoa/Ngành/Môn", "error");
      }
    })();
  }, [isOpen, openNotify]);

  const nganhTheoKhoa = useMemo(
    () => nganhList.filter((n) => !form.khoa_id || n.khoa_id === form.khoa_id),
    [nganhList, form.khoa_id]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleNganh = (id: string) => {
    setForm((s) => ({
      ...s,
      nganh_ids: s.nganh_ids.includes(id)
        ? s.nganh_ids.filter((x) => x !== id)
        : [...s.nganh_ids, id],
    }));
  };

  // Chỉ khi thêm điều kiện -> dkList có phần tử -> mới add class vào div
  const addDk = () =>
    setDkList((s) => [
      ...s,
      { mon_lien_quan_id: "", loai: "tien_quyet", bat_buoc: true },
    ]);

  const rmDk = (idx: number) => setDkList((s) => s.filter((_, i) => i !== idx));

  const updateDk = (
    idx: number,
    patch: Partial<{
      mon_lien_quan_id: string;
      loai: string;
      bat_buoc: boolean;
    }>
  ) =>
    setDkList((s) =>
      s.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );

  const handleSubmit = async () => {
    if (!form.ma_mon || !form.ten_mon || !form.so_tin_chi || !form.khoa_id) {
      openNotify?.(
        "Vui lòng nhập đủ Mã môn, Tên môn, Số tín chỉ và Khoa",
        "warning"
      );
      return;
    }

    const payload: any = {
      ma_mon: form.ma_mon,
      ten_mon: form.ten_mon,
      so_tin_chi: Number(form.so_tin_chi),
      khoa_id: form.khoa_id,
      loai_mon: form.loai_mon || undefined,
      la_mon_chung: form.la_mon_chung === "true",
      thu_tu_hoc: Number(form.thu_tu_hoc) || 1,
      nganh_ids: form.nganh_ids,
      dieu_kien: dkList
        .filter((dk) => dk.mon_lien_quan_id)
        .map((dk) => ({
          mon_lien_quan_id: dk.mon_lien_quan_id,
          loai: dk.loai,
          bat_buoc: dk.bat_buoc,
        })),
    };

    try {
      const res = await fetch(
        `${API2}/pdt/mon-hoc`,
        withToken2({ method: "POST", body: JSON.stringify(payload) })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Thêm môn học thành công", "success");
        onCreated?.();
        onClose();
        // reset form
        setForm({
          ma_mon: "",
          ten_mon: "",
          so_tin_chi: "",
          khoa_id: "",
          loai_mon: "chuyen_nganh",
          la_mon_chung: "false",
          thu_tu_hoc: "1",
          nganh_ids: [],
        });
        setDkList([]);
      } else openNotify?.(json.message || "Thêm thất bại", "error");
    } catch {
      openNotify?.("Không thể gọi API", "error");
    }
  };

  if (!isOpen) return null;

  // Chỉ add class "crud_nganh-list" cho khối Môn điều kiện khi dkList có phần tử
  const dkListClassName = dkList.length > 0 ? "crud_nganh-list" : "";

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-popup">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="modal-header">
              <h1>Thêm môn học</h1>
              <button type="button" className="md-btn-cancel" onClick={onClose}>
                X
              </button>
            </div>

            <div className="modal-popup-row">
              <div className="form__group">
                <label className="pos__unset">Mã môn</label>
                <input
                  name="ma_mon"
                  value={form.ma_mon}
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Tên môn</label>
                <input
                  name="ten_mon"
                  value={form.ten_mon}
                  onChange={handleChange}
                />
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
                  onChange={handleChange}
                />
              </div>
              <div className="form__group">
                <label className="pos__unset">Thứ tự học</label>
                <input
                  name="thu_tu_hoc"
                  type="number"
                  min={1}
                  value={form.thu_tu_hoc}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                >
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
                  onChange={handleChange}
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
                    <label key={n.id}>
                      <input
                        type="checkbox"
                        checked={form.nganh_ids.includes(n.id)}
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
                  onClick={addDk}
                >
                  + Thêm điều kiện
                </button>

                {/* Ban đầu không có class; sau khi bấm nút (dkList > 0) mới gán "crud_nganh-list" */}
                <div className={dkListClassName}>
                  {dkList.map((dk, idx) => (
                    <div className="flex_col" key={idx}>
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
                        onChange={(e) =>
                          updateDk(idx, { loai: e.target.value })
                        }
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

export default ModalThemMonHoc;
