import { useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useTraCuuHocPhan } from "../../features/sv/hooks";
import type { MonHocTraCuuDTO } from "../../features/sv/types";
import HocKySelector from "../../components/HocKySelector";

export default function TraCuuMonHoc() {
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loaiMonFilter, setLoaiMonFilter] = useState<string>("all");

  // ✅ Fetch data
  const { data: monHocs, loading: loadingData } =
    useTraCuuHocPhan(selectedHocKyId);

  // ✅ Filter data
  const filteredData = useMemo(() => {
    let result = monHocs;

    if (loaiMonFilter !== "all") {
      result = result.filter((mon) => mon.loaiMon === loaiMonFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (mon) =>
          mon.maMon.toLowerCase().includes(q) ||
          mon.tenMon.toLowerCase().includes(q)
      );
    }

    return result;
  }, [monHocs, loaiMonFilter, searchQuery]);

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRA CỨU HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        {/* ✅ Filters */}
        <div className="selecy__duyethp__container">
          <HocKySelector onHocKyChange={setSelectedHocKyId} />

          {/* Loại môn */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={loaiMonFilter}
              onChange={(e) => setLoaiMonFilter(e.target.value)}
              disabled={!selectedHocKyId}
            >
              <option value="all">Tất cả loại môn</option>
              <option value="chuyen_nganh">Chuyên ngành</option>
              <option value="dai_cuong">Đại cương</option>
              <option value="tu_chon">Tự chọn</option>
            </select>
          </div>

          {/* Search */}
          <div className="form__group__tracuu">
            <input
              type="text"
              className="form__input"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedHocKyId}
            />
            <label className="form__floating-label">Tìm theo mã/tên môn</label>
          </div>
        </div>

        {/* ✅ Data Table */}
        {loadingData ? (
          <p style={{ textAlign: "center", padding: 40 }}>
            Đang tải danh sách học phần...
          </p>
        ) : (
          <>
            {filteredData.map((mon: MonHocTraCuuDTO) => (
              <fieldset key={mon.stt} className="fieldeset__dkhp mt_20">
                <legend>
                  {mon.stt}. {mon.maMon} - {mon.tenMon} ({mon.soTinChi} TC) -{" "}
                  <span style={{ color: "#3b82f6" }}>
                    {mon.loaiMon === "chuyen_nganh"
                      ? "Chuyên ngành"
                      : mon.loaiMon === "dai_cuong"
                      ? "Đại cương"
                      : "Tự chọn"}
                  </span>
                </legend>

                <table className="table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã lớp</th>
                      <th>Giảng viên</th>
                      <th>Sĩ số</th>
                      <th>Thời khóa biểu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mon.danhSachLop.map((lop: any, idx: any) => (
                      <tr key={lop.id}>
                        <td>{idx + 1}</td>
                        <td>{lop.maLop}</td>
                        <td>{lop.giangVien}</td>
                        <td>
                          {lop.soLuongHienTai}/{lop.soLuongToiDa}
                        </td>

                        <td style={{ whiteSpace: "pre-line" }}>
                          {lop.thoiKhoaBieu}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </fieldset>
            ))}

            {filteredData.length === 0 && selectedHocKyId && (
              <p style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                {searchQuery || loaiMonFilter !== "all"
                  ? "Không tìm thấy môn học phù hợp với bộ lọc"
                  : "Chưa có học phần nào trong học kỳ này"}
              </p>
            )}

            {!selectedHocKyId && (
              <p style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                Vui lòng chọn học kỳ để tra cứu
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
