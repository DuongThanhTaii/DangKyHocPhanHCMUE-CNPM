import { useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";

type MonHoc = {
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  loai_mon?: "tu_chon" | "chuyen_nganh" | string;
};

export default function TraCuuMonHoc() {
  const { openNotify } = useModalContext();
  const [searchValue, setSearchValue] = useState<string>("");
  const [data, setData] = useState<MonHoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchJSON(
        `/api/mon-hoc/search?q=${encodeURIComponent(searchValue.trim())}`,
        {
          method: "GET",
        }
      );
      const result: MonHoc[] = Array.isArray(res) ? res : res?.data ?? [];
      setData(result);
    } catch (err) {
      console.error(err);
      openNotify?.("Không thể tìm kiếm môn học", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRA CỨU MÔN HỌC</p>
      </div>

      <div className="body__inner">
        {/* Form tìm kiếm */}
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form__group__tracuu">
            <input
              type="text"
              className="form__input"
              placeholder=""
              required
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <label className="form__floating-label">Tìm kiếm môn học</label>
          </div>

          <button type="submit" className="form__button" disabled={loading}>
            <span className="navbar__link-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 4.45999C6.93913 4.45999 5.92172 4.88142 5.17157 5.63157C4.42143 6.38171 4 7.39913 4 8.45999C4 9.52086 4.42143 10.5383 5.17157 11.2884C5.92172 12.0386 6.93913 12.46 8 12.46C9.06087 12.46 10.0783 12.0386 10.8284 11.2884C11.5786 10.5383 12 9.52086 12 8.45999C12 7.39913 11.5786 6.38171 10.8284 5.63157C10.0783 4.88142 9.06087 4.45999 8 4.45999ZM2 8.45999C1.99988 7.5157 2.22264 6.58471 2.65017 5.74274C3.0777 4.90077 3.69792 4.17159 4.4604 3.61452C5.22287 3.05745 6.10606 2.68821 7.03815 2.53683C7.97023 2.38545 8.92488 2.45621 9.82446 2.74335C10.724 3.03048 11.5432 3.5259 12.2152 4.18929C12.8872 4.85268 13.3931 5.66533 13.6919 6.56113C13.9906 7.45693 14.0737 8.41059 13.9343 9.34455C13.795 10.2785 13.4372 11.1664 12.89 11.936L17.707 16.753C17.8892 16.9416 17.99 17.1942 17.9877 17.4564C17.9854 17.7186 17.8802 17.9694 17.6948 18.1548C17.5094 18.3402 17.2586 18.4454 16.9964 18.4477C16.7342 18.4499 16.4816 18.3492 16.293 18.167L11.477 13.351C10.5794 13.9893 9.52335 14.3682 8.42468 14.4461C7.326 14.5241 6.22707 14.2981 5.2483 13.793C4.26953 13.2878 3.44869 12.523 2.87572 11.5823C2.30276 10.6417 1.99979 9.56143 2 8.45999Z"
                  fill="currentColor"
                />
              </svg>
            </span>{" "}
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>

        {/* Kết quả */}
        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã môn</th>
              <th>Tên môn</th>
              <th>Số tín chỉ</th>
              <th>Loại môn</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={`${row.ma_mon}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.ma_mon}</td>
                <td>{row.ten_mon}</td>
                <td>{row.so_tin_chi}</td>
                <td>
                  {row.loai_mon === "tu_chon"
                    ? "Tự chọn"
                    : row.loai_mon === "chuyen_nganh"
                    ? "Bắt buộc"
                    : "Không rõ"}
                </td>
              </tr>
            ))}

            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
