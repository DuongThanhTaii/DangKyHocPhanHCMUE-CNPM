// src/pages/pdt/DuyetHocPhan.tsx
import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import Fuse from "fuse.js";
import { useModalContext } from "../../hook/ModalContext";
import { useHocKyNienKhoa, useGetHocKyHienHanh } from "../pdt/hooks";
import type { DeXuatHocPhanForTruongKhoaDTO } from "../tk/types";
import type { DuyetHocPhanProps } from "./types";

/* ================= Types ================= */
type Role = "pdt" | "truong_khoa" | "tro_ly_khoa" | "phong_dao_tao" | ""; // ✅ Thêm "phong_dao_tao"

interface StoredUser {
  loai_tai_khoan?: Role;
}

/* ================= Component ================= */
export default function DuyetHocPhan({
  data: dsDeXuat, // ✅ Nhận data từ props
  loading: loadingDeXuat, // ✅ Nhận loading từ props
  error: errorDeXuat, // ✅ Nhận error từ props
  actions, // ✅ Nhận actions từ props
}: DuyetHocPhanProps) {
  const { openNotify } = useModalContext();

  const {
    data: hocKyNienKhoas,
    loading: loadingHocKy,
    error: errorHocKy,
  } = useHocKyNienKhoa();

  const {
    data: hocKyHienHanh,
    loading: loadingHocKyHienHanh,
    error: errorHocKyHienHanh,
  } = useGetHocKyHienHanh();

  const [userRole, setUserRole] = useState<Role>("");
  const [filteredDsDeXuat, setFilteredDsDeXuat] = useState<
    DeXuatHocPhanForTruongKhoaDTO[]
  >([]);

  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [tempSelectedNienKhoa, setTempSelectedNienKhoa] = useState<string>("");
  const [tempSelectedHocKyId, setTempSelectedHocKyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  /* -------- Fuse search -------- */
  const fuse = useMemo(() => {
    return new Fuse<DeXuatHocPhanForTruongKhoaDTO>(dsDeXuat, {
      keys: ["maHocPhan", "tenHocPhan", "giangVien"],
      threshold: 0.3,
    });
  }, [dsDeXuat]);

  /* -------- Helpers -------- */
  const hienThiTrangThai = (tt: string) => {
    const statusMap: Record<string, string> = {
      cho_duyet: "Chờ trưởng khoa duyệt",
      da_duyet_tk: "Chờ PĐT duyệt",
      pdt_duyet: "PĐT đã duyệt",
      da_duyet_pdt: "PDT đã duyệt",
      tu_choi: "Đã từ chối",
    };
    return statusMap[tt] || tt;
  };

  const getStatusColor = (tt: string) => {
    const colorMap: Record<string, string> = {
      cho_duyet: "#e39932ff",
      truong_khoa_duyet: "#318fabff",
      pdt_duyet: "#1ea11eff",
      da_duyet_pdt: "#1ea11eff",
      tu_choi: "#bf2e29ff",
    };
    return colorMap[tt] || "#6c757d";
  };

  const isActionEnabled = (role: Role, tt: string): boolean => {
    if (role === "tro_ly_khoa") return false;
    if (role === "truong_khoa") return tt === "cho_duyet";
    if (role === "phong_dao_tao") return tt === "da_duyet_tk"; // ✅ Fix type
    return false;
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
  }, []);

  useEffect(() => {
    if (hocKyHienHanh && hocKyNienKhoas.length > 0 && !selectedHocKyId) {
      const foundNienKhoa = hocKyNienKhoas.find((nk) =>
        nk.hocKy.some((hk) => hk.id === hocKyHienHanh.id)
      );

      if (foundNienKhoa) {
        setSelectedHocKyId(hocKyHienHanh.id);
        setTempSelectedHocKyId(hocKyHienHanh.id);
        setTempSelectedNienKhoa(foundNienKhoa.id);
        openNotify(
          `Đã tự chọn học kỳ hiện tại: ${hocKyHienHanh.tenHocKy} (${foundNienKhoa.tenNienKhoa})`,
          "info"
        );
      }
    }
  }, [hocKyHienHanh, hocKyNienKhoas, selectedHocKyId, openNotify]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDsDeXuat(dsDeXuat);
      return;
    }
    const result = fuse.search(searchQuery.trim()).map((r) => r.item);
    setFilteredDsDeXuat(result);
  }, [searchQuery, dsDeXuat, fuse]);

  /* -------- Derived -------- */
  const dsNienKhoa = useMemo(() => {
    return hocKyNienKhoas.map((nk) => ({
      id: nk.id,
      tenNienKhoa: nk.tenNienKhoa,
    }));
  }, [hocKyNienKhoas]);

  const filteredHocKy = useMemo(() => {
    const nienKhoa = hocKyNienKhoas.find(
      (nk) => nk.id === tempSelectedNienKhoa
    );
    return nienKhoa?.hocKy ?? [];
  }, [hocKyNienKhoas, tempSelectedNienKhoa]);

  const currentSemester = useMemo(() => {
    for (const nienKhoa of hocKyNienKhoas) {
      const hocKy = nienKhoa.hocKy.find((hk) => hk.id === selectedHocKyId);
      if (hocKy) {
        return {
          tenHocKy: hocKy.tenHocKy,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        };
      }
    }
    return null;
  }, [hocKyNienKhoas, selectedHocKyId]);

  const currentSemesterText = currentSemester
    ? ` (Niên khóa ${currentSemester.tenNienKhoa}, Học kỳ ${currentSemester.tenHocKy})`
    : "";

  /* -------- Handlers -------- */
  const handleConfirmSelection = () => {
    if (!tempSelectedHocKyId) {
      openNotify("Vui lòng chọn Học kỳ trước khi xác nhận", "warning");
      return;
    }
    setSelectedHocKyId(tempSelectedHocKyId);

    const nienKhoa = hocKyNienKhoas.find(
      (nk) => nk.id === tempSelectedNienKhoa
    );
    const hocKy = nienKhoa?.hocKy.find((hk) => hk.id === tempSelectedHocKyId);

    if (hocKy && nienKhoa) {
      openNotify(
        `Đã chọn Học kỳ ${hocKy.tenHocKy} (${nienKhoa.tenNienKhoa})`,
        "info"
      );
    }
  };

  // ✅ Handler từ chối (nếu có action)
  const handleTuChoi = (id: string) => {
    if (actions.tuChoiDeXuat) {
      actions.tuChoiDeXuat(id);
    } else {
      openNotify("Chức năng từ chối đang được phát triển", "warning");
    }
  };

  /* -------- Render -------- */
  if (loadingHocKy || loadingHocKyHienHanh || loadingDeXuat) {
    return <p>Đang tải dữ liệu...</p>;
  }
  if (errorHocKy || errorHocKyHienHanh || errorDeXuat) {
    return <p>Lỗi: {errorHocKy || errorHocKyHienHanh || errorDeXuat}</p>;
  }

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
                <option key={nk.id} value={nk.id}>
                  {nk.tenNienKhoa}
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
                <option key={hk.id} value={hk.id}>
                  {hk.tenHocKy}
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
            style={{ width: "100%" }}
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
                const canAct = isActionEnabled(userRole, dx.trangThai);
                return (
                  <tr key={dx.id}>
                    <td>{index + 1}</td>
                    <td>{dx.maHocPhan}</td>
                    <td>{dx.tenHocPhan}</td>
                    <td>{dx.soTinChi}</td>
                    <td>{dx.giangVien}</td>
                    <td>
                      <div
                        style={{
                          backgroundColor: getStatusColor(dx.trangThai),
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
                        {hienThiTrangThai(dx.trangThai)}
                      </div>
                    </td>

                    {userRole !== "tro_ly_khoa" && (
                      <td>
                        {/* Nút Duyệt */}
                        {actions.duyetDeXuat && (
                          <button
                            className="btn__chung w50__h20 mr_10"
                            onClick={() => actions.duyetDeXuat!(dx.id)}
                            disabled={!canAct}
                          >
                            Duyệt
                          </button>
                        )}

                        {/* Nút Từ chối - gọi action từ props */}
                        {actions.tuChoiDeXuat ? (
                          <button
                            className="btn__cancel w50__h20"
                            onClick={() => actions.tuChoiDeXuat!(dx.id)}
                            disabled={!canAct}
                          >
                            Từ chối
                          </button>
                        ) : (
                          <button
                            className="btn__cancel w50__h20"
                            onClick={() =>
                              openNotify(
                                "Chức năng từ chối đang được phát triển",
                                "warning"
                              )
                            }
                            disabled={!canAct}
                          >
                            Từ chối
                          </button>
                        )}
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
      </div>
    </section>
  );
}
