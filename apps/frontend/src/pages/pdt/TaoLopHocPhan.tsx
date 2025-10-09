// src/features/tao-lop-hoc-phan/TaoLopHocPhan.tsx
import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";

type HocPhanRow = {
  hoc_phan_id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  so_luong_sv?: number;
  ten_giang_vien?: string;
  giang_vien_id?: string | null;
};

type HocKyMeta = {
  hoc_ky_id: string;
  ma_hoc_ky: string; // "1" | "2" | "3"...
  ten_nien_khoa: string; // "2025-2026"
  trang_thai_hien_tai?: boolean;
};

type SelectedConfig = {
  soLuongLop: string;
  tietBatDau: string;
  tietKetThuc: string;
  soTietMoiBuoi: string;
  tongSoTiet: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayHoc: string[]; // ["2","3","4","5","6","7"]
  phongHoc: string;
};

export default function TaoLopHocPhan() {
  const { openNotify } = useModalContext();

  // ========= Paging =========
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  // ========= Data =========
  const [list, setList] = useState<HocPhanRow[]>([]);
  const [filtered, setFiltered] = useState<HocPhanRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ========= Semester pickers =========
  const [semesters, setSemesters] = useState<HocKyMeta[]>([]);
  const [nienKhoas, setNienKhoas] = useState<string[]>([]);
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>(""); // đã xác nhận
  const [nkTmp, setNkTmp] = useState<string>(""); // tạm niên khóa
  const [hkTmp, setHkTmp] = useState<string>(""); // tạm học kỳ

  // ========= UI/Status =========
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ========= Selected config per hoc_phan_id =========
  const [selected, setSelected] = useState<Record<string, SelectedConfig>>({});

  const hkByNk = useMemo(
    () => semesters.filter((s) => s.ten_nien_khoa === nkTmp),
    [semesters, nkTmp]
  );

  // ======= Fetch semesters =======
  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await fetchJSON("/api/metadata/semesters");
      const arr: HocKyMeta[] = Array.isArray(res) ? res : res?.data ?? [];
      setSemesters(arr);
      setNienKhoas(Array.from(new Set(arr.map((x) => x.ten_nien_khoa))));

      const cur = arr.find((x) => x.trang_thai_hien_tai);
      if (cur) {
        setSelectedHocKyId(cur.hoc_ky_id);
        setNkTmp(cur.ten_nien_khoa);
        setHkTmp(cur.hoc_ky_id);
        openNotify(
          `Đã tự chọn học kỳ hiện tại: ${cur.ma_hoc_ky} (${cur.ten_nien_khoa})`,
          "info"
        );
      }
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Lỗi khi tải danh sách học kỳ.");
      openNotify("Không tải được danh sách học kỳ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ======= Fetch data by semester =======
  const fetchData = async (hocKyId: string) => {
    if (!hocKyId) {
      setList([]);
      setFiltered([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchJSON(
        `/api/pdt/tao-lop-hoc-phan/danh-sach?idHocKy=${encodeURIComponent(
          hocKyId
        )}`,
        { method: "GET" }
      );
      const data: HocPhanRow[] = Array.isArray(res) ? res : res?.data ?? [];
      setList(data);
      setFiltered(data);
      setError(null);
      openNotify(`Đã tải ${data.length} học phần`, "info");
    } catch (e) {
      console.error(e);
      setError("Lỗi tải dữ liệu.");
      setList([]);
      setFiltered([]);
      openNotify("Không tải được danh sách học phần", "error");
    } finally {
      setLoading(false);
    }
  };

  // ======= Effects =======
  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedHocKyId) fetchData(selectedHocKyId);
  }, [selectedHocKyId]);

  useEffect(() => {
    const valid = Array.isArray(list) ? list : [];
    if (!searchQuery.trim()) {
      setFiltered(valid);
    } else {
      const q = searchQuery.trim().toLowerCase();
      setFiltered(
        valid.filter(
          (i) =>
            i.ma_mon?.toLowerCase().includes(q) ||
            i.ten_mon?.toLowerCase().includes(q) ||
            String(i.so_tin_chi ?? "").includes(q) ||
            i.ten_giang_vien?.toLowerCase().includes(q)
        )
      );
    }
    setCurrentPage(1);
  }, [searchQuery, list]);

  // ======= Handlers =======

  const handleConfirmSemester = () => {
    if (!nkTmp) {
      openNotify("Vui lòng chọn Niên khóa trước", "warning");
      return;
    }
    if (!hkTmp) {
      openNotify("Vui lòng chọn Học kỳ trước khi xác nhận", "warning");
      return;
    }
    if (hkTmp === selectedHocKyId) {
      openNotify("Bạn đang ở đúng học kỳ này rồi", "info");
      return;
    }
    setSelectedHocKyId(hkTmp);
    const hk = semesters.find((x) => x.hoc_ky_id === hkTmp);
    if (hk) {
      openNotify(
        `Đã chọn Học kỳ ${hk.ma_hoc_ky} (${hk.ten_nien_khoa})`,
        "success"
      );
    }
  };

  const handleCheck = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          soLuongLop: "",
          tietBatDau: "",
          tietKetThuc: "",
          soTietMoiBuoi: "",
          tongSoTiet: "",
          ngayBatDau: "",
          ngayKetThuc: "",
          ngayHoc: [],
          phongHoc: "",
        };
      }
      return next;
    });
  };

  const handleChange = (
    id: string,
    field: keyof SelectedConfig,
    value: any
  ) => {
    setSelected((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          soLuongLop: "",
          tietBatDau: "",
          tietKetThuc: "",
          soTietMoiBuoi: "",
          tongSoTiet: "",
          ngayBatDau: "",
          ngayKetThuc: "",
          ngayHoc: [],
          phongHoc: "",
        }),
        [field]: value,
      },
    }));
  };

  const validateConfig = (cfg: SelectedConfig) => {
    // ví dụ validate nhẹ nhàng
    if (!cfg.soLuongLop || Number(cfg.soLuongLop) <= 0)
      return "Số lớp phải > 0";
    if (!cfg.tietBatDau || !cfg.tietKetThuc)
      return "Thiếu tiết bắt đầu/kết thúc";
    if (Number(cfg.tietKetThuc) < Number(cfg.tietBatDau))
      return "Tiết kết thúc phải >= tiết bắt đầu";
    if (!cfg.ngayBatDau || !cfg.ngayKetThuc)
      return "Thiếu ngày bắt đầu/kết thúc";
    if (new Date(cfg.ngayKetThuc) < new Date(cfg.ngayBatDau))
      return "Ngày kết thúc phải >= ngày bắt đầu";
    if (!cfg.ngayHoc?.length) return "Chưa chọn ngày học";
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedHocKyId) {
      openNotify("Vui lòng chọn Học kỳ trước khi tạo lớp", "warning");
      return;
    }

    const entries = Object.entries(selected);
    if (entries.length === 0) {
      openNotify("Chưa chọn học phần nào để tạo lớp", "warning");
      return;
    }

    // Validate từng config
    for (const [hocPhanId, cfg] of entries) {
      const msg = validateConfig(cfg);
      if (msg) {
        const row = list.find((hp) => hp.hoc_phan_id === hocPhanId);
        openNotify(`HP ${row?.ma_mon || hocPhanId}: ${msg}`, "warning");
        return;
      }
    }

    const danhSachLop = entries.map(([hocPhanId, data]) => {
      const row = list.find((hp) => hp.hoc_phan_id === hocPhanId);
      const giangVienId = row?.giang_vien_id ?? null;
      return { hocPhanId, giangVienId, ...data };
    });

    try {
      await fetchJSON("/api/pdt/tao-lop-hoc-phan", {
        method: "POST",
        body: { danhSachLop },
      });
      setSelected({});
      fetchData(selectedHocKyId);
      openNotify(
        `Tạo ${danhSachLop.length} lớp học phần thành công`,
        "success"
      );
    } catch (e) {
      console.error(e);
      openNotify("Tạo lớp học phần thất bại", "error");
    }
  };

  // ======= Paging compute =======

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filtered.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ======= Header text =======

  const currentSemester = semesters.find(
    (x) => x.hoc_ky_id === selectedHocKyId
  );
  const currentSemesterText = currentSemester
    ? ` (Niên khóa ${currentSemester.ten_nien_khoa}, Học kỳ ${currentSemester.ma_hoc_ky})`
    : "";

  // ======= UI =======

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">
          TẠO LỚP HỌC PHẦN{currentSemesterText}
        </p>
      </div>

      <div className="body__inner">
        {/* Chọn học kỳ */}
        <div className="selecy__duyethp__container">
          <div className="form__group__ctt mr_10">
            <select
              className="form__input form__select"
              value={nkTmp}
              onChange={(e) => {
                setNkTmp(e.target.value);
                setHkTmp("");
              }}
            >
              <option value="">-- Chọn Niên khóa --</option>
              {nienKhoas.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
                </option>
              ))}
            </select>
          </div>

          <div className="form__group__ctt mr_10">
            <select
              className="form__input form__select"
              value={hkTmp}
              onChange={(e) => setHkTmp(e.target.value)}
              disabled={!nkTmp}
            >
              <option value="">-- Chọn Học kỳ --</option>
              {hkByNk.map((hk) => (
                <option key={hk.hoc_ky_id} value={hk.hoc_ky_id}>
                  Học kỳ {hk.ma_hoc_ky}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn__chung h__40"
            onClick={handleConfirmSemester}
            disabled={!hkTmp || hkTmp === selectedHocKyId}
          >
            Xác nhận
          </button>
        </div>

        {/* Search */}
        <div className="form__group__tracuu">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên học phần, giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form__input"
            style={{ width: 400 }}
          />
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Mã HP</th>
              <th>Tên HP</th>
              <th>STC</th>
              <th>Số SV</th>
              <th>Giảng viên</th>
              <th>Số lớp</th>
              <th>Tiết BD</th>
              <th>Tiết KT</th>
              <th>Số tiết/buổi</th>
              <th>Tổng tiết</th>
              <th>Phòng học</th>
              <th>Ngày học</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((hp) => {
                const sel = selected[hp.hoc_phan_id];
                const disabled = !sel;
                return (
                  <tr key={hp.hoc_phan_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={() => handleCheck(hp.hoc_phan_id)}
                      />
                    </td>
                    <td>{hp.ma_mon}</td>
                    <td>{hp.ten_mon}</td>
                    <td>{hp.so_tin_chi}</td>
                    <td>{hp.so_luong_sv ?? ""}</td>
                    <td>{hp.ten_giang_vien ?? ""}</td>

                    <td>
                      <input
                        className="w__48"
                        type="number"
                        disabled={disabled}
                        value={sel?.soLuongLop ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "soLuongLop",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w__48"
                        type="number"
                        disabled={disabled}
                        value={sel?.tietBatDau ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "tietBatDau",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w__48"
                        type="number"
                        disabled={disabled}
                        value={sel?.tietKetThuc ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "tietKetThuc",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w__48"
                        type="number"
                        disabled={disabled}
                        value={sel?.soTietMoiBuoi ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "soTietMoiBuoi",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w__48"
                        type="number"
                        disabled={disabled}
                        value={sel?.tongSoTiet ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "tongSoTiet",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="w__48"
                        type="text"
                        disabled={disabled}
                        value={sel?.phongHoc ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "phongHoc",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      {["2", "3", "4", "5", "6", "7"].map((thu) => (
                        <label key={thu} style={{ marginRight: 4 }}>
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={sel?.ngayHoc?.includes(thu) ?? false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const cur = sel?.ngayHoc ?? [];
                              const updated = checked
                                ? Array.from(new Set([...cur, thu]))
                                : cur.filter((t) => t !== thu);
                              handleChange(hp.hoc_phan_id, "ngayHoc", updated);
                            }}
                          />
                          T{thu}
                        </label>
                      ))}
                    </td>

                    <td>
                      <input
                        type="date"
                        disabled={disabled}
                        value={sel?.ngayBatDau ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "ngayBatDau",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        disabled={disabled}
                        value={sel?.ngayKetThuc ?? ""}
                        onChange={(e) =>
                          handleChange(
                            hp.hoc_phan_id,
                            "ngayKetThuc",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={15} style={{ textAlign: "center" }}>
                  Không có học phần nào để tạo lớp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "1rem" }}>
          <button
            className="btn__chung h__40 w__60"
            onClick={handleSubmit}
            disabled={Object.keys(selected).length === 0}
          >
            Tạo
          </button>
        </div>
      </div>

      {/* Paging */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: "0 4px",
              padding: "3px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: currentPage === i + 1 ? "#0c4874" : "#fff",
              color: currentPage === i + 1 ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
