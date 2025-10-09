// src/pages/pdt/DuyetHocPhan.tsx
import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import Fuse from "fuse.js";
import { useModalContext } from "../../hook/ModalContext";

/* ================= Types ================= */
type Role = "pdt" | "truong_khoa" | "tro_ly_khoa" | "";

type TrangThaiDeXuat =
  | "cho_duyet"
  | "truong_khoa_duyet"
  | "pdt_duyet"
  | "tu_choi";

interface DeXuatHocPhan {
  id: string;
  ma_mon?: string;
  ten_mon?: string;
  so_tin_chi?: number;
  ten_giang_vien?: string;
  trang_thai: TrangThaiDeXuat;
}

interface HocKyMeta {
  hoc_ky_id: string;
  ma_hoc_ky: string; // "HK1" | "HK2" | "HK3"
  ten_nien_khoa: string; // "2025-2026" ...
  trang_thai_hien_tai?: boolean;
}

interface StoredUser {
  loai_tai_khoan?: Role;
}

/* ================= Const ================= */
const STATUS_LABEL: Record<TrangThaiDeXuat, string> = {
  cho_duyet: "Chờ trưởng khoa duyệt",
  truong_khoa_duyet: "Chờ PĐT duyệt",
  pdt_duyet: "PĐT đã duyệt",
  tu_choi: "Đã từ chối",
};

const STATUS_COLOR: Record<TrangThaiDeXuat, string> = {
  cho_duyet: "#e39932ff",
  truong_khoa_duyet: "#318fabff",
  pdt_duyet: "#1ea11eff",
  tu_choi: "#bf2e29ff",
};

/* ================= Component ================= */
export default function DuyetHocPhan() {
  const { openNotify } = useModalContext();

  const [userRole, setUserRole] = useState<Role>("");

  const [dsDeXuat, setDsDeXuat] = useState<DeXuatHocPhan[]>([]);
  const [filteredDsDeXuat, setFilteredDsDeXuat] = useState<DeXuatHocPhan[]>([]);
  const [dsHocKy, setDsHocKy] = useState<HocKyMeta[]>([]);
  const [dsNienKhoa, setDsNienKhoa] = useState<string[]>([]);

  // học kỳ đã xác nhận để lấy data
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  // giá trị tạm từ dropdown
  const [tempSelectedNienKhoa, setTempSelectedNienKhoa] = useState<string>("");
  const [tempSelectedHocKyId, setTempSelectedHocKyId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- Fuse search -------- */
  const fuse = useMemo(() => {
    return new Fuse<DeXuatHocPhan>(dsDeXuat, {
      keys: ["ma_mon", "ten_mon", "ten_giang_vien"],
      threshold: 0.3,
    });
  }, [dsDeXuat]);

  /* -------- Helpers -------- */
  const hienThiTrangThai = (tt: TrangThaiDeXuat) => STATUS_LABEL[tt] ?? tt;
  const getStatusColor = (tt: TrangThaiDeXuat) => STATUS_COLOR[tt] ?? "#6c757d";

  // Quy tắc enable nút theo role + trạng thái
  const isActionEnabled = (role: Role, tt: TrangThaiDeXuat): boolean => {
    if (role === "tro_ly_khoa") return false; // TLK không có nút
    if (role === "truong_khoa") return tt === "cho_duyet";
    if (role === "pdt") return tt === "truong_khoa_duyet";
    return false;
  };

  const filterEligibleForBulk = (list: DeXuatHocPhan[]) =>
    list.filter((x) => isActionEnabled(userRole, x.trang_thai));

  /* -------- API (đồng bộ fetchJSON) -------- */
  // GET /api/metadata/semesters
  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const semesters = await fetchJSON("/api/metadata/semesters");
      const arr: HocKyMeta[] = Array.isArray(semesters)
        ? semesters
        : semesters?.data ?? [];
      const safeArr = Array.isArray(arr) ? arr : [];

      setDsHocKy(safeArr);
      setDsNienKhoa(Array.from(new Set(safeArr.map((hk) => hk.ten_nien_khoa))));

      // Auto chọn học kỳ hiện tại nếu có
      const current = safeArr.find((hk) => hk.trang_thai_hien_tai);
      if (current) {
        setSelectedHocKyId(current.hoc_ky_id);
        setTempSelectedHocKyId(current.hoc_ky_id);
        setTempSelectedNienKhoa(current.ten_nien_khoa);
        await fetchData(current.hoc_ky_id);
        openNotify(
          `Đã tự chọn học kỳ hiện tại: ${current.ma_hoc_ky} (${current.ten_nien_khoa})`,
          "info"
        );
      }
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải danh sách học kỳ:", err);
      setError(
        "Lỗi khi tải danh sách học kỳ. Vui lòng kiểm tra quyền truy cập."
      );
      openNotify("Không tải được danh sách học kỳ", "error");
    } finally {
      setLoading(false);
    }
  };

  // GET /api/de-xuat-hoc-phan?idHocKy=...
  const fetchData = async (hocKyId: string) => {
    if (!hocKyId) {
      setDsDeXuat([]);
      setFilteredDsDeXuat([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJSON(`/api/de-xuat-hoc-phan?idHocKy=${hocKyId}`);
      const arr: DeXuatHocPhan[] = Array.isArray(data)
        ? data
        : data?.data ?? [];
      const safeArr = Array.isArray(arr) ? arr : [];
      setDsDeXuat(safeArr);
      setFilteredDsDeXuat(safeArr);
      setError(null);
      openNotify(`Đã tải ${safeArr.length} đề xuất học phần`, "info");
    } catch (err) {
      console.error("Lỗi tải dữ liệu đề xuất:", err);
      setError("Lỗi tải dữ liệu đề xuất.");
      setDsDeXuat([]);
      setFilteredDsDeXuat([]);
      openNotify("Không tải được danh sách đề xuất", "error");
    } finally {
      setLoading(false);
    }
  };

  // PUT /api/de-xuat-hoc-phan/:id/approve  { action: 'approve' | 'reject' }
  const handleAction = async (id: string, hanhDong: "duyet" | "tu_choi") => {
    try {
      const res = await fetchJSON(`/api/de-xuat-hoc-phan/${id}/approve`, {
        method: "PUT",
        body: { action: hanhDong === "duyet" ? "approve" : "reject" },
      });

      if (res?.error || res?.success === false) {
        throw new Error(res?.error || "Thao tác thất bại");
      }

      openNotify(
        hanhDong === "duyet" ? "Đã duyệt đề xuất" : "Đã từ chối đề xuất",
        "success"
      );
      fetchData(selectedHocKyId);
    } catch (err) {
      console.error("Handle action error:", err);
      openNotify("Thao tác thất bại", "error");
    }
  };

  // POST /api/de-xuat-hoc-phan/bulk-update  { ids: string[], action: 'approve' | 'reject' }
  const handleBulkAction = async (hanhDong: "duyet" | "tu_choi") => {
    const eligible = filterEligibleForBulk(filteredDsDeXuat);
    const ids = eligible.map((x) => x.id);
    if (!ids.length) {
      openNotify("Không có mục nào hợp lệ để cập nhật", "warning");
      return;
    }

    try {
      const res = await fetchJSON("/api/de-xuat-hoc-phan/bulk-update", {
        method: "POST",
        body: { ids, action: hanhDong === "duyet" ? "approve" : "reject" },
      });

      if (res?.error || res?.success === false) {
        throw new Error(res?.error || "Không thể cập nhật hàng loạt");
      }

      openNotify(
        `${hanhDong === "duyet" ? "Đã duyệt" : "Đã từ chối"} ${
          ids.length
        } đề xuất`,
        "success"
      );
      fetchData(selectedHocKyId);
    } catch (err) {
      console.error("Bulk action error:", err);
      openNotify("Cập nhật hàng loạt thất bại", "error");
    }
  };

  /* -------- Effects -------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user: StoredUser = JSON.parse(storedUser);
        setUserRole(user.loai_tai_khoan ?? "");
      } catch {
        setUserRole("");
      }
    }
    fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDsDeXuat(dsDeXuat);
      return;
    }
    const result = fuse.search(searchQuery.trim()).map((r) => r.item);
    setFilteredDsDeXuat(result);
  }, [searchQuery, dsDeXuat, fuse]);

  /* -------- Derived -------- */
  const filteredHocKy: HocKyMeta[] = useMemo(() => {
    return dsHocKy.filter((hk) => hk.ten_nien_khoa === tempSelectedNienKhoa);
  }, [dsHocKy, tempSelectedNienKhoa]);

  const currentSemester = useMemo(
    () => dsHocKy.find((hk) => hk.hoc_ky_id === selectedHocKyId) || null,
    [dsHocKy, selectedHocKyId]
  );

  const currentSemesterText = currentSemester
    ? ` (Niên khóa ${currentSemester.ten_nien_khoa}, Học kỳ ${currentSemester.ma_hoc_ky})`
    : "";

  /* -------- Handlers -------- */
  const handleConfirmSelection = () => {
    if (!tempSelectedHocKyId) {
      openNotify("Vui lòng chọn Học kỳ trước khi xác nhận", "warning");
      return;
    }
    setSelectedHocKyId(tempSelectedHocKyId);
    fetchData(tempSelectedHocKyId);
    const hk = dsHocKy.find((x) => x.hoc_ky_id === tempSelectedHocKyId);
    if (hk) {
      openNotify(
        `Đã chọn Học kỳ ${hk.ma_hoc_ky} (${hk.ten_nien_khoa})`,
        "info"
      );
    }
  };

  /* -------- Render -------- */
  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">
          DUYỆT DANH SÁCH HỌC PHẦN {currentSemesterText}
        </p>
      </div>

      <div className="body__inner">
        {/* Lọc niên khóa & học kỳ */}
        <div className="selecy__duyethp__container">
          <div className="form__group__ctt mr_10">
            <select
              className="form__input form__select"
              value={tempSelectedNienKhoa}
              onChange={(e) => {
                setTempSelectedNienKhoa(e.target.value);
                setTempSelectedHocKyId("");
              }}
            >
              <option value="">-- Chọn Niên khóa --</option>
              {dsNienKhoa.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
                </option>
              ))}
            </select>
          </div>

          <div className="form__group__ctt mr_10">
            <select
              className="form__input form__select"
              value={tempSelectedHocKyId}
              onChange={(e) => setTempSelectedHocKyId(e.target.value)}
              disabled={!tempSelectedNienKhoa}
            >
              <option value="">-- Chọn Học kỳ --</option>
              {filteredHocKy.map((hk) => (
                <option key={hk.hoc_ky_id} value={hk.hoc_ky_id}>
                  Học kỳ {hk.ma_hoc_ky}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn__chung h__40"
            onClick={handleConfirmSelection}
            disabled={
              !tempSelectedHocKyId || tempSelectedHocKyId === selectedHocKyId
            }
          >
            Xác nhận
          </button>
        </div>

        {/* Search */}
        <div className="form__group__tracuu" style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã môn, tên môn, hoặc giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form__input"
            style={{ width: 400 }}
          />
        </div>

        <table className="table table__duyethp">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã HP</th>
              <th>Tên HP</th>
              <th>STC</th>
              <th>Giảng viên</th>
              <th>Trạng thái</th>
              {userRole !== "tro_ly_khoa" && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDsDeXuat.length ? (
              filteredDsDeXuat.map((dx, index) => {
                const canAct = isActionEnabled(userRole, dx.trang_thai);
                return (
                  <tr key={dx.id}>
                    <td>{index + 1}</td>
                    <td>{dx.ma_mon ?? "-"}</td>
                    <td>{dx.ten_mon ?? "-"}</td>
                    <td>{dx.so_tin_chi ?? "-"}</td>
                    <td>{dx.ten_giang_vien ?? "-"}</td>
                    <td>
                      <div
                        style={{
                          backgroundColor: getStatusColor(dx.trang_thai),
                          borderRadius: 20,
                          padding: "4px 8px",
                          height: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hienThiTrangThai(dx.trang_thai)}
                      </div>
                    </td>

                    {userRole !== "tro_ly_khoa" && (
                      <td>
                        <button
                          className="btn__chung w50__h20 mr_10"
                          onClick={() => handleAction(dx.id, "duyet")}
                          disabled={!canAct}
                          title={
                            canAct
                              ? "Duyệt đề xuất"
                              : "Không thể thao tác ở trạng thái hiện tại"
                          }
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn__cancel w50__h20"
                          onClick={() => handleAction(dx.id, "tu_choi")}
                          disabled={!canAct}
                          title={
                            canAct
                              ? "Từ chối đề xuất"
                              : "Không thể thao tác ở trạng thái hiện tại"
                          }
                        >
                          Từ chối
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={userRole !== "tro_ly_khoa" ? 7 : 6}
                  style={{ textAlign: "center" }}
                >
                  Không có đề xuất nào cần duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {userRole !== "tro_ly_khoa" && (
          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn__chung mr_20 h__40"
              onClick={() => handleBulkAction("duyet")}
              disabled={!filterEligibleForBulk(filteredDsDeXuat).length}
              title={
                filterEligibleForBulk(filteredDsDeXuat).length
                  ? "Duyệt tất cả đề xuất hợp lệ"
                  : "Không có mục nào hợp lệ để duyệt"
              }
            >
              Duyệt tất cả
            </button>
            <button
              className="btn__cancel h__40"
              onClick={() => handleBulkAction("tu_choi")}
              disabled={!filterEligibleForBulk(filteredDsDeXuat).length}
              title={
                filterEligibleForBulk(filteredDsDeXuat).length
                  ? "Từ chối tất cả đề xuất hợp lệ"
                  : "Không có mục nào hợp lệ để từ chối"
              }
            >
              Từ chối tất cả
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
