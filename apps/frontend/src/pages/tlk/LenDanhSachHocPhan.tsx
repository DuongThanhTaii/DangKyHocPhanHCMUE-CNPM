// apps/frontend/src/pages/tlk/LenDanhSachHocPhan.tsx
import React, { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useModalContext } from "../../hook/ModalContext";
import { tlkAPI } from "../../features/tlk/api/tlkAPI";
type MonHoc = {
  id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
};
type GiangVien = { id: string; ho_ten: string };
type DeXuatRow = { monHocId: string; soLuongLop: number; giangVienId: string };
type HocKyHienHanh = {
  hoc_ky_id: string;
  ten_hoc_ky: string;
  nien_khoa: string;
};

const API = import.meta.env.VITE_API_URL;

const LenDanhSachHocPhan: React.FC = () => {
  const { openNotify } = useModalContext();

  const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
  const [filteredMonHocs, setFilteredMonHocs] = useState<MonHoc[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<DeXuatRow[]>([]);
  const [giangVienByMon, setGiangVienByMon] = useState<
    Record<string, GiangVien[]>
  >({});
  const [hocKyHienHanh, setHocKyHienHanh] = useState<HocKyHienHanh | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token") || "";

  const fuse = useMemo(
    () =>
      new Fuse<MonHoc>(monHocs, {
        keys: ["ma_mon", "ten_mon"],
        threshold: 0.3,
      }),
    [monHocs]
  );

  const fetchHocKyHienHanh = async () => {
    try {
      const res = await fetch(`${API}/hien-hanh`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không lấy được học kỳ hiện hành");
      const data: HocKyHienHanh = await res.json();
      setHocKyHienHanh(data);
      openNotify?.(
        `Học kỳ hiện hành: ${data.ten_hoc_ky} • Niên khóa ${data.nien_khoa}`,
        "info"
      );
    } catch (err) {
      console.error(err);
      openNotify?.("Không lấy được học kỳ hiện hành", "warning");
      setHocKyHienHanh(null);
    }
  };

  const fetchMonHocs = async () => {
    try {
      const res = await fetch(`${API}/tlk/mon-hoc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const out = await res.json();
      if (res.ok && Array.isArray(out.data)) {
        setMonHocs(out.data);
        setFilteredMonHocs(out.data);
        openNotify?.(`Đã tải ${out.data.length} môn học`, "info");
      } else {
        setMonHocs([]);
        setFilteredMonHocs([]);
        openNotify?.("Không có dữ liệu môn học", "warning");
      }
    } catch (err) {
      console.error(err);
      setMonHocs([]);
      setFilteredMonHocs([]);
      openNotify?.("Lỗi khi tải danh sách môn học", "error");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchHocKyHienHanh(), fetchMonHocs()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) {
      setFilteredMonHocs(monHocs);
      openNotify?.("Đã làm mới danh sách môn học", "info");
      return;
    }
    const results = fuse.search(q).map((r) => r.item);
    setFilteredMonHocs(results);
    if (results.length === 0)
      openNotify?.("Không tìm thấy môn học phù hợp", "warning");
    else openNotify?.(`Tìm thấy ${results.length} môn học`, "info");
  };

  const toggleSelectMon = async (monHocId: string) => {
    const existed = selectedRows.find((r) => r.monHocId === monHocId);
    if (existed) {
      setSelectedRows((prev) => prev.filter((r) => r.monHocId !== monHocId));
      openNotify?.("Đã bỏ chọn môn", "info");
      return;
    }
    // nạp danh sách GV cho môn (nếu chưa có)
    if (!giangVienByMon[monHocId]) {
      try {
        const res = await fetch(
          `${API}/tlk/giang-vien?mon_hoc_id=${monHocId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: { data: GiangVien[] } = await res.json();
        setGiangVienByMon((prev) => ({
          ...prev,
          [monHocId]: data?.data ?? [],
        }));
      } catch (err) {
        console.error(err);
        openNotify?.(
          "Không tải được danh sách giảng viên cho môn này",
          "error"
        );
      }
    }
    setSelectedRows((prev) => [
      ...prev,
      { monHocId, soLuongLop: 1, giangVienId: "" },
    ]);
    openNotify?.("Đã thêm môn vào danh sách đề xuất", "success");
  };

  const onChangeGV = (monHocId: string, giangVienId: string) =>
    setSelectedRows((prev) =>
      prev.map((r) => (r.monHocId === monHocId ? { ...r, giangVienId } : r))
    );

  const onChangeSoLuongLop = (monHocId: string, so: number) =>
    setSelectedRows((prev) =>
      prev.map((r) =>
        r.monHocId === monHocId ? { ...r, soLuongLop: Math.max(1, so) } : r
      )
    );

  /**
   */
  const addDeXuat = async (monHoc: MonHoc, giangVienId: string) => {
    try {
      setSubmitting(true);

      const result = await tlkAPI.createDeXuatHocPhan({
        maHocPhan: monHoc.id,
        maGiangVien: giangVienId || "", // ✅ Dùng giangVienId từ param
      });

      if (result.isSuccess) {
        openNotify?.(`Đã thêm đề xuất: ${monHoc.ten_mon}`, "success");
        await fetchMonHocs(); // Reload
      } else {
        openNotify?.(result.message || "Thêm đề xuất thất bại", "error");
      }
    } catch (err: any) {
      console.error(err);
      openNotify?.(err?.message || "Lỗi khi thêm đề xuất", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">LÊN DANH SÁCH HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        <div style={{ marginBottom: 14, opacity: 0.85 }}>
          {hocKyHienHanh ? (
            <small>
              Học kỳ hiện hành: <b>{hocKyHienHanh.ten_hoc_ky}</b> — Niên khóa{" "}
              <b>{hocKyHienHanh.nien_khoa}</b>
            </small>
          ) : (
            <small>
              {loading
                ? "Đang tải học kỳ hiện hành…"
                : "Chưa có học kỳ hiện hành"}
            </small>
          )}
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="form__group form__group__ctt">
            <input
              type="text"
              id="search-input"
              className="form__input"
              placeholder=" "
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <label
              htmlFor="search-input"
              className="form__floating-label top__21"
            >
              Nhập thông tin môn học
            </label>
          </div>
          <button
            type="submit"
            className="btn__chung w__200 h__40"
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tìm kiếm"}
          </button>
        </form>

        <table className="table table_ldshp">
          <thead>
            <tr>
              <th className="c-chon">Chọn</th>
              <th className="c-ma">Mã MH</th>
              <th className="c-ten">Tên MH</th>
              <th className="c-stc">STC</th>
              <th className="c-gv">Giảng viên</th>
              <th className="c-action">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredMonHocs.map((mh) => {
              const checked = selectedRows.some((r) => r.monHocId === mh.id);
              const current = selectedRows.find((r) => r.monHocId === mh.id);
              const gvs = giangVienByMon[mh.id] ?? [];
              return (
                <tr key={mh.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectMon(mh.id)}
                    />
                  </td>
                  <td>{mh.ma_mon}</td>
                  <td>{mh.ten_mon}</td>
                  <td>{mh.so_tin_chi}</td>
                  <td>
                    {checked && (
                      <select
                        value={current?.giangVienId ?? ""}
                        onChange={(e) => onChangeGV(mh.id, e.target.value)}
                      >
                        <option value="">-- Chọn --</option>
                        {gvs.map((gv) => (
                          <option key={gv.id} value={gv.id}>
                            {gv.ho_ten}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td>
                    {checked ? (
                      <button
                        className="btn__chung h__40"
                        onClick={() =>
                          addDeXuat(mh, current?.giangVienId || "")
                        } // ✅ Truyền giangVienId
                        disabled={submitting}
                      >
                        {submitting ? "Đang xử lý..." : "Thêm"}
                      </button>
                    ) : (
                      <span style={{ opacity: 0.5 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredMonHocs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Không tìm thấy môn học nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {selectedRows.length > 0 && (
          <button
            className="btn__chung"
            //onClick={addDeXuat}
            disabled={submitting}
            style={{ marginTop: "1rem", padding: "8px 16px" }}
          >
            {submitting ? "Đang gửi..." : "Xác nhận đề xuất"}
          </button>
        )}
      </div>
    </section>
  );
};

export default LenDanhSachHocPhan;
