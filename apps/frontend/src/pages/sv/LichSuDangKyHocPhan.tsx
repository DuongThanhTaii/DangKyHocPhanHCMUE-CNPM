import { useEffect, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useModalContext } from "../../hook/ModalContext";
import { fetchJSON } from "../../utils/fetchJSON";

type LichSuItem = {
  id: string;
  trang_thai_text: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  ma_so_sinh_vien?: string | null;
  ngay_dang_ky: string;
};

export default function LichSuDangKy() {
  const { openNotify } = useModalContext();

  const [lichSu, setLichSu] = useState<LichSuItem[]>([]);
  const [namHoc, setNamHoc] = useState<string>("");
  const [hocKy, setHocKy] = useState<string>("");
  const [namHocList, setNamHocList] = useState<string[]>([]);
  const [hocKyList, setHocKyList] = useState<string[]>([]);
  const [loadingTerms, setLoadingTerms] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    const fetchAcademicTerms = async () => {
      try {
        setLoadingTerms(true);
        const res = await fetchJSON("/api/get-academic-terms", {
          method: "GET",
        });
        const ok = (res as any)?.success;
        if (ok) {
          const nh = (res as any).namHocList ?? [];
          const hk = (res as any).hocKyList ?? [];
          setNamHocList(nh);
          setHocKyList(hk);
          openNotify(
            `Đã tải ${nh.length} năm học và ${hk.length} học kỳ`,
            "info"
          );
        } else {
          setNamHocList([]);
          setHocKyList([]);
          openNotify("Không lấy được danh sách năm học và học kỳ", "warning");
        }
      } catch (error) {
        setNamHocList([]);
        setHocKyList([]);
        openNotify("Lỗi khi lấy danh sách năm học và học kỳ", "error");
        console.error("Failed to fetch academic terms:", error);
      } finally {
        setLoadingTerms(false);
      }
    };
    fetchAcademicTerms();
  }, [openNotify]);

  useEffect(() => {
    const fetchLichSu = async (currentNamHoc: string, currentHocKy: string) => {
      try {
        setLoadingHistory(true);
        const qs: string[] = [];
        if (currentNamHoc)
          qs.push(`namHoc=${encodeURIComponent(currentNamHoc)}`);
        if (currentHocKy) qs.push(`hocKy=${encodeURIComponent(currentHocKy)}`);
        const url = `/api/lich-su-dang-ky${
          qs.length ? `?${qs.join("&")}` : ""
        }`;

        const res = await fetchJSON(url, { method: "GET" });
        const ok = (res as any)?.success;
        if (ok) {
          const rows = ((res as any).data ?? []) as LichSuItem[];
          setLichSu(rows);
          openNotify(
            rows.length
              ? `Đã tải ${rows.length} dòng lịch sử`
              : "Không có dữ liệu lịch sử cho bộ lọc hiện tại",
            rows.length ? "info" : "warning"
          );
        } else {
          setLichSu([]);
          openNotify("Không lấy được dữ liệu lịch sử", "warning");
        }
      } catch {
        setLichSu([]);
        openNotify("Lỗi khi lấy lịch sử đăng ký", "error");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchLichSu(namHoc, hocKy);
  }, [namHoc, hocKy, openNotify]);

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">LỊCH SỬ ĐĂNG KÝ HỌC PHẦN</p>
      </div>
      <div className="body__inner">
        <form
          className="selecy__duyethp__container"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <select
              className="form__select mr_20"
              value={namHoc}
              onChange={(e) => setNamHoc(e.target.value)}
              disabled={loadingTerms}
            >
              <option value="">-- Chọn năm học --</option>
              {namHocList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="form__select"
              value={hocKy}
              onChange={(e) => setHocKy(e.target.value)}
              disabled={loadingTerms}
            >
              <option value="">-- Chọn học kỳ --</option>
              {hocKyList.map((ky) => (
                <option key={ky} value={ky}>
                  {ky}
                </option>
              ))}
            </select>
          </div>
        </form>

        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Thao tác</th>
              <th>Mã HP</th>
              <th>Tên HP</th>
              <th>STC</th>
              <th>Thao tác bởi</th>
              <th>Vào ngày</th>
            </tr>
          </thead>
          <tbody>
            {lichSu.map((item, index) => (
              <tr
                key={item.id}
                className={
                  item.trang_thai_text === "Đã hủy" ? "row-cancelled" : ""
                }
              >
                <td>{index + 1}</td>
                <td>{item.trang_thai_text}</td>
                <td>{item.ma_mon}</td>
                <td>{item.ten_mon}</td>
                <td>{item.so_tin_chi}</td>
                <td>{item.ma_so_sinh_vien || "Sinh viên"}</td>
                <td>{new Date(item.ngay_dang_ky).toLocaleString("vi-VN")}</td>
              </tr>
            ))}
            {lichSu.length === 0 && !loadingHistory && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Không có dữ liệu.
                </td>
              </tr>
            )}
            {loadingHistory && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", opacity: 0.7 }}>
                  Đang tải lịch sử...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
