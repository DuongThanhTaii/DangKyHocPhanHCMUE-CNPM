// src/pages/pdt/mon-hoc/QuanLyMonHoc.tsx
import React, { useEffect, useMemo, useState } from "react";
import ModalThemMonHoc from "../../components/crud_mh/ModalThemMonHoc";
import ModalCapNhatMonHoc from "../../components/crud_mh/ModalCapNhatMonHoc";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";
import { useModalContext } from "../../../../hook/ModalContext";

export type MonHoc = {
  id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  khoa_id: string;
  loai_mon?: string | null;
  la_mon_chung?: boolean | null;
  thu_tu_hoc?: number | null;
  khoa?: { id: string; ten_khoa: string } | null;
  mon_hoc_nganh?: { nganh_hoc: { id: string; ten_nganh: string } }[];
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

// Map giá trị trong DB -> nhãn hiển thị
const LOAI_MON_LABEL: Record<string, string> = {
  tu_chon: "Tự chọn",
  chuyen_nganh: "Chuyên ngành",
  dai_cuong: "Đại cương",
};

const formatLoaiMon = (v?: string | null) => (v ? LOAI_MON_LABEL[v] ?? v : "-");

const QuanLyMonHoc: React.FC = () => {
  const { openNotify, openConfirm } = useModalContext();

  const [allMH, setAllMH] = useState<MonHoc[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [khoaList, setKhoaList] = useState<Khoa[]>([]);
  const [filterKhoa, setFilterKhoa] = useState<string>("");
  const [filterLoai, setFilterLoai] = useState<string>("");
  const [filterMonChung, setFilterMonChung] = useState<string>(""); // "true" | "false" | ""

  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const loadMonHoc = async () => {
    try {
      const res = await fetch(
        `${API}/pdt/mon-hoc?page=1&pageSize=10000`,
        withToken()
      );
      const json = await res.json();
      if (!json.isSuccess) throw new Error(json.message);
      setAllMH(json.data?.items ?? []);
    } catch (e) {
      console.error(e);
      openNotify?.("Không thể tải danh sách môn học", "error");
    }
  };

  const loadDanhMuc = async () => {
    try {
      const res = await fetch(`${API}/dm/khoa`, withToken());
      const json = await res.json();
      setKhoaList(json?.data || []);
    } catch {
      // có thể bỏ qua
    }
  };

  useEffect(() => {
    loadMonHoc();
    loadDanhMuc();
  }, []);

  const filtered = useMemo(() => {
    let list = allMH;
    if (filterKhoa)
      list = list.filter(
        (x) => x.khoa_id === filterKhoa || x.khoa?.id === filterKhoa
      );
    if (filterLoai)
      list = list.filter(
        (x) => (x.loai_mon || "").toLowerCase() === filterLoai.toLowerCase()
      );
    if (filterMonChung) {
      const flag = filterMonChung === "true";
      list = list.filter((x) => Boolean(x.la_mon_chung) === flag);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((mh) =>
        [
          mh.ma_mon,
          mh.ten_mon,
          mh.khoa?.ten_khoa,
          mh.loai_mon,
          formatLoaiMon(mh.loai_mon), // thêm nhãn tiếng Việt để search
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [allMH, search, filterKhoa, filterLoai, filterMonChung]);

  const handleDelete = async (id: string) => {
    const ok = await (openConfirm
      ? openConfirm({
          message: "Bạn có chắc muốn xoá môn học này?",
          variant: "danger",
          confirmText: "Xoá",
          cancelText: "Hủy",
        })
      : Promise.resolve(window.confirm("Bạn có chắc muốn xoá môn học này?")));
    if (!ok) return;

    try {
      const res = await fetch(
        `${API}/pdt/mon-hoc/${id}`,
        withToken({ method: "DELETE" })
      );
      const json = await res.json();
      if (json.isSuccess) {
        openNotify?.("Đã xoá môn học", "success");
        setAllMH((prev) => prev.filter((x) => x.id !== id));
      } else {
        openNotify?.(json.message || "Xoá thất bại", "error");
      }
    } catch {
      openNotify?.("Không thể gọi API", "error");
    }
  };

  return (
    <section className="">
      <div className="">
        <fieldset className="fieldset__quanly">
          <legend>Tổng: {filtered.length} môn</legend>

          <button className="btn__add" onClick={() => setShowAddModal(true)}>
            +
          </button>
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

              <select
                className="form__input form__select mr_20"
                value={filterLoai}
                onChange={(e) => setFilterLoai(e.target.value)}
              >
                <option value="">-- Loại môn --</option>
                <option value="chuyen_nganh">Chuyên ngành</option>
                <option value="dai_cuong">Đại cương</option>
                <option value="tu_chon">Tự chọn</option>
              </select>

              <select
                className="form__input form__select mr_20"
                value={filterMonChung}
                onChange={(e) => setFilterMonChung(e.target.value)}
              >
                <option value="">-- Là môn chung? --</option>
                <option value="true">Có</option>
                <option value="false">Không</option>
              </select>

              <button
                className="btn__chung h__40 w__100"
                onClick={() => {
                  setFilterKhoa("");
                  setFilterLoai("");
                  setFilterMonChung("");
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
              placeholder="Tìm theo mã, tên, khoa, loại môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="table table_quanly">
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>STC</th>
                <th>Khoa</th>
                <th>Loại</th>
                <th>Môn chung</th>
                <th>Ngành áp dụng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mh) => (
                <tr key={mh.id}>
                  <td>{mh.ma_mon}</td>
                  <td>{mh.ten_mon}</td>
                  <td>{mh.so_tin_chi}</td>
                  <td>{mh.khoa?.ten_khoa}</td>
                  <td>{formatLoaiMon(mh.loai_mon)}</td>
                  <td>{mh.la_mon_chung ? "Có" : "Không"}</td>
                  <td>
                    {mh.mon_hoc_nganh
                      ?.map((x) => x.nganh_hoc.ten_nganh)
                      .join(", ")}
                  </td>
                  <td className="w40">
                    <div className="btn__quanly__container">
                      <button
                        className="btn-cancel w50__h20"
                        onClick={() => handleDelete(mh.id)}
                      >
                        Xoá
                      </button>
                      <button
                        className="btn__update w20__h20"
                        onClick={() => setEditId(mh.id)}
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
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    Không có môn học
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </fieldset>
      </div>

      {showAddModal && (
        <ModalThemMonHoc
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            loadMonHoc();
            openNotify?.("Đã thêm môn học", "success");
          }}
        />
      )}

      {editId && (
        <ModalCapNhatMonHoc
          id={editId}
          isOpen={!!editId}
          onClose={() => {
            setEditId(null);
            loadMonHoc();
            openNotify?.("Cập nhật môn học thành công", "success");
          }}
        />
      )}
    </section>
  );
};

export default QuanLyMonHoc;
