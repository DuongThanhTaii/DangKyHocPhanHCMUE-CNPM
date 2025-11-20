import { useNavigate } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useGVLopHocPhan } from "../../features/gv/hooks"; // ✅ Reuse GV hook

export default function SVLopHocPhanList() {
  const navigate = useNavigate();
  const { data: rows, loading } = useGVLopHocPhan();

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">LỚP HỌC PHẦN CỦA TÔI</p>
      </div>

      <div className="body__inner">
        {loading && (
          <p style={{ textAlign: "center", padding: 20 }}>
            Đang tải dữ liệu...
          </p>
        )}

        {!loading && (
          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Môn học</th>
                  <th>Tên học phần</th>
                  <th>STC</th>
                  <th>Sĩ số</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.ma_lop}</td>
                    <td>
                      {r.hoc_phan.mon_hoc.ma_mon} — {r.hoc_phan.mon_hoc.ten_mon}
                    </td>
                    <td>{r.hoc_phan.ten_hoc_phan}</td>
                    <td>{r.hoc_phan.mon_hoc.so_tin_chi}</td>
                    <td>
                      {r.so_luong_hien_tai}/{r.so_luong_toi_da}
                    </td>
                    <td>
                      <button
                        className="btn__chung"
                        onClick={() => navigate(`/sv/lop-hoc-phan/${r.id}`)}
                      >
                        Xem tài liệu
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      Chưa đăng ký lớp học phần nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
