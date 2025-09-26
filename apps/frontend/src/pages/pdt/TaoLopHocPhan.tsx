import React, { useEffect, useState } from "react";
import api from "../../utils/api";

type HP = { id: string; ma_hp: string; ten_hp: string };

type Form = {
  hoc_phan_id: string;
  si_so: number;
  thu: number;
  tiet_bat_dau: number;
  so_tiet: number;
  phong: string;
};

export default function TaoLopHocPhan() {
  const [hocPhan, setHocPhan] = useState<HP[]>([]);
  const [form, setForm] = useState<Form>({
    hoc_phan_id: "",
    si_so: 50,
    thu: 2,
    tiet_bat_dau: 1,
    so_tiet: 3,
    phong: "A101",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<HP[]>("/pdt/hoc-phan-da-duyet");
        setHocPhan(res.data);
      } catch (e) {
        setHocPhan([]);
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/pdt/lop-hoc-phan", form);
    alert("Tạo lớp học phần thành công (demo)");
  };

  return (
    <div className="card">
      <h2>Tạo lớp học phần</h2>
      <form onSubmit={submit} className="form-grid">
        <label>
          Học phần
          <select
            value={form.hoc_phan_id}
            onChange={(e) => setForm({ ...form, hoc_phan_id: e.target.value })}
            required
          >
            <option value="">-- Chọn học phần --</option>
            {hocPhan.map((hp) => (
              <option key={hp.id} value={hp.id}>
                {hp.ma_hp} - {hp.ten_hp}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sĩ số
          <input
            type="number"
            min={1}
            value={form.si_so}
            onChange={(e) => setForm({ ...form, si_so: +e.target.value })}
          />
        </label>
        <label>
          Thứ
          <input
            type="number"
            min={2}
            max={8}
            value={form.thu}
            onChange={(e) => setForm({ ...form, thu: +e.target.value })}
          />
        </label>
        <label>
          Tiết bắt đầu
          <input
            type="number"
            min={1}
            max={15}
            value={form.tiet_bat_dau}
            onChange={(e) =>
              setForm({ ...form, tiet_bat_dau: +e.target.value })
            }
          />
        </label>
        <label>
          Số tiết
          <input
            type="number"
            min={1}
            max={6}
            value={form.so_tiet}
            onChange={(e) => setForm({ ...form, so_tiet: +e.target.value })}
          />
        </label>
        <label>
          Phòng
          <input
            value={form.phong}
            onChange={(e) => setForm({ ...form, phong: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary">Tạo lớp</button>
        </div>
      </form>
    </div>
  );
}
