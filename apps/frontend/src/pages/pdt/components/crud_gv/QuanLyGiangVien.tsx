// ================================
// src/pages/pdt/QuanLyGiangVien.tsx
// ================================
import React, { useEffect, useMemo, useState } from "react";
import ModalThemGiangVien from "./ModalThemGiangVien";
import ModalCapNhatGiangVien from "./ModalCapNhatGiangVien";
import { useModalContext } from "../../../../hook/ModalContext";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";

type GiangVien = {
  id: string;
  khoa_id: string;
  trinh_do?: string | null;
  chuyen_mon?: string | null;
  kinh_nghiem_giang_day?: number | null;
  users: {
    id: string;
    ho_ten: string;
    ma_nhan_vien?: string | null;
    tai_khoan?: { ten_dang_nhap: string } | null;
  };
  khoa?: { id: string; ten_khoa: string } | null;
};

type Khoa = { id: string; ten_khoa: string };

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const withToken = (init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
};

const QuanLyGiangVien: React.FC = () => {
  const { openNotify, openConfirm } = useModalContext();

  const [allGV, setAllGV] = useState<GiangVien[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [khoaList, setKhoaList] = useState<Khoa[]>([]);
  const [filterKhoa, setFilterKhoa] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const loadGV = async () => {
    try {
      const res = await fetch(`${API}/pdt/giang-vien`, withToken());
      const json = await res.json();
      if (!json.isSuccess) throw new Error(json.message);
      const items: GiangVien[] = json.data?.items ?? [];
      setAllGV(items);
    } catch (e) {
      console.error(e);
      openNotify?.("Không thể tải danh sách giảng viên", "error");
    }
  };

  const loadDanhMuc = async () => {
    try {
      const res = await fetch(`${API}/dm/khoa`, withToken());
      const json = await res.json();
      setKhoaList(json?.data || []);
    } catch {
      // có thể bỏ qua, không cần notify
    }
  };

  useEffect(() => {
    loadGV();
    loadDanhMuc();
  }, []);

  const filtered = useMemo(() => {
    let list = allGV;
    if (filterKhoa)
      list = list.filter(
        (x) => x.khoa_id === filterKhoa || x.khoa?.id === filterKhoa
      );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((gv) =>
        [
          gv.users?.ho_ten,
          gv.users?.ma_nhan_vien,
          gv.khoa?.ten_khoa,
          gv.trinh_do,
          gv.chuyen_mon,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [allGV, filterKhoa, search]);

  const handleDelete = async (id: string) => {
    const ok = await (openConfirm
      ? openConfirm({
          message: "Bạn có chắc muốn xoá giảng viên này?",
          variant: "danger",
          confirmText: "Xoá",
          cancelText: "Hủy",
        })
      : Promise.resolve(
          window.confirm("Bạn có chắc muốn xoá giảng viên này?")
        ));
    if (!ok) return;

    try {
      const res = await fetch(
        `${API}/pdt/giang-vien/${id}`,
        withToken({ method: "DELETE" })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Đã xoá giảng viên", "success");
        setAllGV((prev) => prev.filter((x) => x.id !== id));
      } else {
        throw new Error(json.message);
      }
    } catch (e) {
      console.error(e);
      openNotify?.("Lỗi khi xoá giảng viên", "error");
    }
  };

  return (
    <section className="">
      <div className="">
        <fieldset className="fieldset__quanly">
          <legend>Tổng: {filtered.length} giảng viên</legend>

          {/* + thêm */}
          <button className="btn__add" onClick={() => setShowAddModal(true)}>
            +
          </button>
          {/* - lọc */}
          <button
            className="btn__sort"
            onClick={() => setShowFilters((s) => !s)}
          >
            -
          </button>

          {showFilters && (
            <div className="filter-group selecy__duyethp__container mt_20">
              <select
                className="form__input form__select mr_20"
                value={filterKhoa}
                onChange={(e) => setFilterKhoa(e.target.value)}
              >
                <option value="">-- Khoa --</option>
                {khoaList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ten_khoa}
                  </option>
                ))}
              </select>
              <button
                className="btn__chung h__40 w__100"
                onClick={() => {
                  setFilterKhoa("");
                }}
              >
                Xoá lọc
              </button>
            </div>
          )}

          <div className="form__group form__group__quanly mtb_20">
            <input
              type="text"
              className="form__input h__40 w__100p"
              placeholder="Tìm kiếm theo tên, MGV, khoa, trình độ, chuyên môn"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="table table_quanly">
            <thead>
              <tr>
                <th>Họ và Tên</th>
                <th>MGV</th>
                <th>Khoa</th>
                {/* <th>Trình độ</th> */}
                <th>Chuyên môn</th>
                <th>Kinh nghiệm (năm)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((gv) => (
                <tr key={gv.id}>
                  <td>{gv.users?.ho_ten}</td>
                  <td>{gv.users?.ma_nhan_vien}</td>
                  <td>{gv.khoa?.ten_khoa}</td>
                  {/* <td>{gv.trinh_do}</td> */}
                  <td>{gv.chuyen_mon}</td>
                  <td>{gv.kinh_nghiem_giang_day ?? 0}</td>
                  <td className="w40">
                    <div className="btn__quanly__container">
                      <button
                        className="btn-cancel w50__h20"
                        onClick={() => handleDelete(gv.id)}
                      >
                        Xóa
                      </button>
                      <button
                        className="btn__update w20__h20"
                        onClick={() => setEditId(gv.id)}
                        title="Chỉnh sửa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                        >
                          <path
                            fill="currentColor"
                            d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    Không có giảng viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </fieldset>
      </div>

      {showAddModal && (
        <ModalThemGiangVien
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadGV();
            openNotify?.("Đã thêm giảng viên mới", "success");
          }}
        />
      )}

      {editId && (
        <ModalCapNhatGiangVien
          id={editId}
          isOpen={!!editId}
          onClose={() => {
            setEditId(null);
            loadGV();
            openNotify?.("Cập nhật giảng viên thành công", "success");
          }}
        />
      )}
    </section>
  );
};

export default QuanLyGiangVien;
