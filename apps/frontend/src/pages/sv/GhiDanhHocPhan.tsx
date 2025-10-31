// src/features/ghi-danh/GhiDanhHocPhan.tsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useModalContext } from "../../hook/ModalContext";
import {
  useMonHocGhiDanh,
  useGhiDanhMonHoc,
  useCheckTrangThaiGhiDanh,
} from "../../features/sv/hooks";
import { svApi } from "../../features/sv/api/svApi";
import type { JSX } from "react";
import type { MonHocDaGhiDanh } from "../../features/sv/types"; // ✅ Import correct type

type HocPhan = {
  id: string;
  hoc_phan_id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  ten_khoa: string;
  ten_giang_vien?: string;
};

type HocPhanDaGhiDanh = HocPhan & {
  ghi_danh_id: string;
};

export default function GhiDanhHocPhan(): JSX.Element {
  const { openNotify } = useModalContext();

  const {
    canGhiDanh,
    loading: checkingStatus,
    message: statusMessage,
  } = useCheckTrangThaiGhiDanh();

  const {
    data: monHocGhiDanhData,
    loading: loadingMonHoc,
    refetch: refetchMonHoc,
  } = useMonHocGhiDanh();

  const {
    loading: submitting,
    ghiDanhNhieuMonHoc,
    huyGhiDanhNhieuMonHoc,
  } = useGhiDanhMonHoc();

  const hocPhanList: HocPhan[] = monHocGhiDanhData.map((mh) => ({
    id: mh.id,
    hoc_phan_id: mh.id,
    ma_mon: mh.maMonHoc,
    ten_mon: mh.tenMonHoc,
    so_tin_chi: mh.soTinChi,
    ten_khoa: mh.tenKhoa,
    ten_giang_vien: mh.tenGiangVien,
  }));

  const [filteredList, setFilteredList] = useState<HocPhan[]>([]);
  const [daGhiDanhList, setDaGhiDanhList] = useState<HocPhanDaGhiDanh[]>([]); // ✅ Use extended type
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedToCancelIds, setSelectedToCancelIds] = useState<string[]>([]); // ✅ ghiDanhIds
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ✅ Backend decides enrollment phase
  const isNotEnrollmentPhase = !canGhiDanh;

  const totalCourses = daGhiDanhList.length;
  const totalCredits = daGhiDanhList.reduce(
    (sum, hp) => sum + (hp.so_tin_chi || 0),
    0
  );

  const didInit = useRef<boolean>(false);
  const lastToastKey = useRef<string | undefined>(undefined);

  // ✅ Fetch enrolled courses with ghiDanhId
  const fetchDaGhiDanh = async () => {
    try {
      const result = await svApi.getDanhSachDaGhiDanh();
      if (result.isSuccess && result.data) {
        const dsGD: HocPhanDaGhiDanh[] = result.data.map(
          (item: MonHocDaGhiDanh) => ({
            id: item.monHocId,
            hoc_phan_id: item.monHocId,
            ghi_danh_id: item.ghiDanhId,
            ma_mon: item.maMonHoc,
            ten_mon: item.tenMonHoc,
            so_tin_chi: item.soTinChi,
            ten_khoa: item.tenKhoa,
            ten_giang_vien: item.tenGiangVien,
          })
        );
        setDaGhiDanhList(dsGD);
      }
    } catch (e) {
      console.error(e);
      openNotify({
        message: "Không tải được danh sách đã ghi danh",
        type: "error",
      });
    }
  };

  // ✅ Init: Load data lần đầu
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchDaGhiDanh();
  }, []);

  // ✅ Sync filteredList với hocPhanList
  useEffect(() => {
    setFilteredList(hocPhanList);
  }, [monHocGhiDanhData]);

  // ✅ Show notifications based on backend status
  useEffect(() => {
    if (checkingStatus) return;

    if (isNotEnrollmentPhase) {
      const msg = statusMessage || "Chưa tới thời hạn đăng ký ghi danh";
      if (lastToastKey.current !== msg) {
        lastToastKey.current = msg;
        openNotify({
          message: msg,
          type: "warning",
        });
      }
      return;
    }

    if (!loadingMonHoc && hocPhanList.length > 0) {
      const msg = `Đã tải ${hocPhanList.length} học phần có thể ghi danh • Bạn đã đăng ký ${daGhiDanhList.length} học phần`;
      if (lastToastKey.current !== msg) {
        lastToastKey.current = msg;
        openNotify({
          message: msg,
          type: "info",
        });
      }
    }
  }, [
    checkingStatus,
    isNotEnrollmentPhase,
    loadingMonHoc,
    hocPhanList.length,
    daGhiDanhList.length,
    statusMessage,
  ]);

  const isDaGhiDanh = (hocPhanId: string): boolean =>
    daGhiDanhList.some((hp) => hp.hoc_phan_id === hocPhanId);

  const handleCheck = (id: string): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Handle checkbox for cancellation - use ghiDanhId
  const handleCancelCheck = (ghiDanhId: string): void => {
    setSelectedToCancelIds((prev) =>
      prev.includes(ghiDanhId)
        ? prev.filter((x) => x !== ghiDanhId)
        : [...prev, ghiDanhId]
    );
  };

  // ✅ Ghi danh nhiều môn
  const handleSubmit = async (): Promise<void> => {
    const successCount = await ghiDanhNhieuMonHoc(selectedIds);

    if (successCount > 0) {
      setSelectedIds([]);
      await Promise.all([refetchMonHoc(), fetchDaGhiDanh()]); // Reload data
    }
  };

  // ✅ Pass ghiDanhIds to cancel API
  const handleCancel = async (): Promise<void> => {
    const successCount = await huyGhiDanhNhieuMonHoc(selectedToCancelIds);

    if (successCount > 0) {
      setSelectedToCancelIds([]);
      await Promise.all([refetchMonHoc(), fetchDaGhiDanh()]); // Reload data
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredList(hocPhanList);
      openNotify({
        message: "Đã làm mới danh sách học phần",
        type: "info",
      });
      return;
    }
    const filtered = hocPhanList.filter(
      (hp) =>
        hp.ma_mon.toLowerCase().includes(q) ||
        hp.ten_mon.toLowerCase().includes(q)
    );
    setFilteredList(filtered);

    if (filtered.length === 0) {
      openNotify({
        message: "Không tìm thấy học phần phù hợp",
        type: "warning",
      });
    } else {
      openNotify({
        message: `Tìm thấy ${filtered.length} học phần`,
        type: "info",
      });
    }
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">ĐĂNG KÝ GHI DANH</p>
      </div>

      <div className="body__inner">
        <p className="sub__title_gd">Năm học 2025-2026 - Học kỳ HK01</p>

        {/* Thanh tìm kiếm */}
        <form className="search-form search-form__gd" onSubmit={handleSearch}>
          <div className="form__group">
            <input
              type="text"
              placeholder="Tìm kiếm mã hoặc tên học phần..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form__input h__40"
            />
          </div>
          <button type="submit" className="form__button w__140">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M500.7 138.7L512 149.4L512 96C512 78.3 526.3 64 544 64C561.7 64 576 78.3 576 96L576 224C576 241.7 561.7 256 544 256L416 256C398.3 256 384 241.7 384 224C384 206.3 398.3 192 416 192L463.9 192L456.3 184.8C456.1 184.6 455.9 184.4 455.7 184.2C380.7 109.2 259.2 109.2 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C238.9 39.1 400.7 39 500.7 138.7z"
              />
            </svg>
            Làm mới
          </button>
        </form>

        {/* ✅ Giữ nguyên UI này - chỉ logic thay đổi */}
        {isNotEnrollmentPhase ? (
          <p
            style={{
              marginTop: 35,
              color: "red",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            CHƯA TỚI THỜI HẠN ĐĂNG KÝ GHI DANH. VUI LÒNG QUAY LẠI SAU.
          </p>
        ) : (
          <>
            {/* Fieldset 1 - Có thể ghi danh */}
            <fieldset className="fieldeset__dkhp mt_20">
              <legend>Đăng ký theo kế hoạch</legend>
              <table className="table">
                <thead>
                  <tr>
                    <th>Chọn</th>
                    <th>Mã HP</th>
                    <th>Tên HP</th>
                    <th>STC</th>
                    <th>Khoa</th>
                    <th>Giảng viên</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✅ Bỏ filter, hiển thị tất cả */}
                  {filteredList.map((hp) => (
                    <tr
                      key={hp.id}
                      className={isDaGhiDanh(hp.id) ? "row__highlight" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          disabled={isDaGhiDanh(hp.id)}
                          checked={selectedIds.includes(hp.id)}
                          onChange={() => handleCheck(hp.id)}
                        />
                      </td>
                      <td>{hp.ma_mon}</td>
                      <td>{hp.ten_mon}</td>
                      <td>{hp.so_tin_chi}</td>
                      <td>{hp.ten_khoa}</td>
                      <td>{hp.ten_giang_vien || ""}</td>
                    </tr>
                  ))}

                  {/* ✅ Hiển thị message nếu không có data */}
                  {filteredList.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Không có học phần nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="note__gd">
                Ghi chú: <span className="note__highlight" /> đã đăng ký
              </div>

              <div style={{ marginTop: "1rem" }}>
                <button
                  className="btn__chung mb_10"
                  onClick={handleSubmit}
                  disabled={submitting || selectedIds.length === 0}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận ghi danh"}
                </button>
              </div>
            </fieldset>

            {/* Fieldset 2 - Kết quả ghi danh */}
            <fieldset className="fieldeset__dkhp mt_20">
              <legend>
                Kết quả đăng ký: {totalCourses} học phần, {totalCredits} tín chỉ
              </legend>

              <table className="table">
                <thead>
                  <tr>
                    <th>Chọn</th>
                    <th>Mã HP</th>
                    <th>Tên HP</th>
                    <th>STC</th>
                    <th>Khoa</th>
                    <th>Giảng viên</th>
                  </tr>
                </thead>
                <tbody>
                  {daGhiDanhList.map((hp) => (
                    <tr key={hp.ghi_danh_id}>
                      {" "}
                      {/* ✅ Use ghiDanhId as key */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedToCancelIds.includes(hp.ghi_danh_id)}
                          onChange={() => handleCancelCheck(hp.ghi_danh_id)}
                        />
                      </td>
                      <td>{hp.ma_mon}</td>
                      <td>{hp.ten_mon}</td>
                      <td>{hp.so_tin_chi}</td>
                      <td>{hp.ten_khoa}</td>
                      <td>{hp.ten_giang_vien || "Chưa phân công"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: "1rem" }}>
                <button
                  className="btn__cancel mb_10"
                  onClick={handleCancel}
                  disabled={submitting || selectedToCancelIds.length === 0}
                >
                  {submitting ? "Đang xử lý..." : "Hủy ghi danh"}
                </button>
              </div>
            </fieldset>
          </>
        )}
      </div>
    </section>
  );
}
