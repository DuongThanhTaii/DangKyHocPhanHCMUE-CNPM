// src/features/ghi-danh/GhiDanhHocPhan.tsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";
import type { JSX } from "react";

type HocPhan = {
  id: string;
  hoc_phan_id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  ten_khoa: string;
  ten_giang_vien?: string;
  loai_mon?: "chuyen_nganh" | "tu_chon";
};

export default function GhiDanhHocPhan(): JSX.Element {
  const { openNotify } = useModalContext();

  const [hocPhanList, setHocPhanList] = useState<HocPhan[]>([]);
  const [filteredList, setFilteredList] = useState<HocPhan[]>([]);
  const [daGhiDanhList, setDaGhiDanhList] = useState<HocPhan[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedToCancelIds, setSelectedToCancelIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isNotEnrollmentPhase, setIsNotEnrollmentPhase] =
    useState<boolean>(false);

  const totalCourses = daGhiDanhList.length;
  const totalCredits = daGhiDanhList.reduce(
    (sum, hp) => sum + (hp.so_tin_chi || 0),
    0
  );

  // Chặn double-run của useEffect trong React 18 StrictMode (dev)
  const didInit = useRef<boolean>(false);
  // Chặn việc bắn 2 lần cùng một message (phòng trường hợp remount nhanh)
  const lastToastKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void fetchData({ silent: false });
  }, []);

  const fetchData = async ({
    silent = false,
  }: { silent?: boolean } = {}): Promise<void> => {
    try {
      const [hpRes, gdRes] = await Promise.all([
        fetchJSON("/api/hoc-phan/co-the-ghi-danh"),
        fetchJSON("/api/ghi-danh/my"),
      ]);

      const dsHP: HocPhan[] = Array.isArray(hpRes) ? hpRes : hpRes?.data ?? [];
      const dsGD: HocPhan[] = Array.isArray(gdRes) ? gdRes : gdRes?.data ?? [];

      setHocPhanList(dsHP);
      setFilteredList(dsHP);
      setDaGhiDanhList(dsGD);

      const notPhase = dsHP.length === 0;
      setIsNotEnrollmentPhase(notPhase);

      if (!silent) {
        const msg = notPhase
          ? "Chưa tới thời hạn đăng ký ghi danh"
          : `Đã tải ${dsHP.length} học phần có thể ghi danh • Bạn đã đăng ký ${dsGD.length} học phần`;

        if (lastToastKey.current !== msg) {
          lastToastKey.current = msg;
          openNotify(msg, notPhase ? "warning" : "info");
        }
      }
    } catch (e) {
      console.error(e);
      setIsNotEnrollmentPhase(true);
      if (!silent) openNotify("Không tải được dữ liệu ghi danh", "error");
    }
  };

  const isDaGhiDanh = (hocPhanId: string): boolean =>
    daGhiDanhList.some((hp) => hp.hoc_phan_id === hocPhanId);

  const handleCheck = (id: string): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCancelCheck = (id: string): void => {
    setSelectedToCancelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      openNotify("Chưa chọn học phần để ghi danh", "warning");
      return;
    }

    try {
      await fetchJSON("/api/ghi-danh", {
        method: "POST",
        body: { hocPhanIds: selectedIds },
      });
      openNotify(
        `Ghi danh thành công ${selectedIds.length} học phần`,
        "success"
      );
      setSelectedIds([]);
      await fetchData({ silent: true }); // reload nhưng không hiện toast “chưa tới hạn…”
    } catch (e) {
      console.error(e);
      openNotify("Lỗi ghi danh", "error");
    }
  };

  const handleCancel = async (): Promise<void> => {
    if (selectedToCancelIds.length === 0) {
      openNotify("Chưa chọn học phần để hủy", "warning");
      return;
    }

    try {
      // Nếu backend có API bulk thì thay vòng lặp này bằng 1 request duy nhất
      for (const id of selectedToCancelIds) {
        // id ở đây là hoc_phan_id (đã lấy từ list kết quả ghi danh)
        // đổi URL nếu backend yêu cầu id bản ghi ghi_danh thay vì hoc_phan_id
        // ví dụ: `/api/ghi-danh/by-hoc-phan/${id}`
        await fetchJSON(`/api/ghi-danh/${id}`, { method: "DELETE" });
      }
      openNotify(
        `Hủy ghi danh thành công ${selectedToCancelIds.length} học phần`,
        "success"
      );
      setSelectedToCancelIds([]);
      await fetchData({ silent: true });
    } catch (e) {
      console.error(e);
      openNotify("Lỗi khi hủy ghi danh", "error");
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredList(hocPhanList);
      openNotify("Đã làm mới danh sách học phần", "info");
      return;
    }
    const filtered = hocPhanList.filter(
      (hp) =>
        hp.ma_mon.toLowerCase().includes(q) ||
        hp.ten_mon.toLowerCase().includes(q)
    );
    setFilteredList(filtered);

    if (filtered.length === 0) {
      openNotify("Không tìm thấy học phần phù hợp", "warning");
    } else {
      openNotify(`Tìm thấy ${filtered.length} học phần`, "info");
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

        {/* Nếu chưa tới thời hạn */}
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
                  <tr>
                    <td colSpan={6} style={{ fontWeight: "bold" }}>
                      Bắt buộc
                    </td>
                  </tr>

                  {filteredList
                    .filter((hp) => hp.loai_mon === "chuyen_nganh")
                    .map((hp) => (
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

                  <tr>
                    <td colSpan={6} style={{ fontWeight: "bold" }}>
                      Tự chọn
                    </td>
                  </tr>

                  {filteredList
                    .filter((hp) => hp.loai_mon === "tu_chon")
                    .map((hp) => (
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
                </tbody>
              </table>

              <div className="note__gd">
                Ghi chú: <span className="note__highlight" /> đã đăng ký
              </div>

              <div style={{ marginTop: "1rem" }}>
                <button className="btn__chung mb_10" onClick={handleSubmit}>
                  Xác nhận ghi danh
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
                    <tr key={hp.hoc_phan_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedToCancelIds.includes(hp.hoc_phan_id)}
                          onChange={() => handleCancelCheck(hp.hoc_phan_id)}
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
                <button className="btn__cancel mb_10" onClick={handleCancel}>
                  Hủy ghi danh
                </button>
              </div>
            </fieldset>
          </>
        )}
      </div>
    </section>
  );
}
