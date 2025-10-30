import { useEffect, useMemo, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useTraCuuHocPhan } from "../../features/sv/hooks";
import { useGetHocKyHienHanh } from "../../features/pdt/hooks/useGetHocKyHienHanh";
import { useHocKyNienKhoa } from "../../features/pdt/hooks/useHocKyNienKhoa";
import type { HocKyDTO } from "../../features/pdt/types/pdtTypes";
import type { MonHocTraCuuDTO } from "../../features/sv/types";

export default function TraCuuMonHoc() {
  // ✅ Load học kỳ hiện hành
  const { data: hocKyHienHanh, loading: loadingHocKyHienHanh } =
    useGetHocKyHienHanh();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();

  // ✅ State
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loaiMonFilter, setLoaiMonFilter] = useState<string>("all");

  // ✅ Flatten học kỳ
  const nienKhoas = useMemo(
    () => Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))),
    [hocKyNienKhoas]
  );

  const flatHocKys = useMemo(() => {
    const result: (HocKyDTO & { tenNienKhoa: string })[] = [];

    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({
          ...hk,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        });
      });
    });

    return result;
  }, [hocKyNienKhoas]);

  // ✅ Fetch data
  const { data: monHocs, loading: loadingData } =
    useTraCuuHocPhan(selectedHocKyId);

  useEffect(() => {
    if (hocKyHienHanh && flatHocKys.length > 0 && !selectedHocKyId) {
      const hkHienHanh = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

      if (hkHienHanh) {
        setSelectedNienKhoa(hkHienHanh.tenNienKhoa);
        setSelectedHocKyId(hkHienHanh.id);
      }
    }
  }, [hocKyHienHanh, flatHocKys, selectedHocKyId]);

  useEffect(() => {
    setSelectedHocKyId("");
  }, [selectedNienKhoa]);

  // ✅ Filter data
  const filteredData = useMemo(() => {
    let result = monHocs;

    // Filter by loại môn
    if (loaiMonFilter !== "all") {
      result = result.filter((mon) => mon.loaiMon === loaiMonFilter);
    }

    // Filter by search query
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

  // ✅ Stats
  const totalMons = filteredData.length;
  const totalLops = filteredData.reduce(
    (sum, mon) => sum + mon.danhSachLop.length,
    0
  );

  // ✅ Render loading
  if (loadingHocKy || loadingHocKyHienHanh) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">TRA CỨU HỌC PHẦN</p>
        </div>
        <div
          className="body__inner"
          style={{ textAlign: "center", padding: 40 }}
        >
          Đang tải dữ liệu...
        </div>
      </section>
    );
  }

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TRA CỨU HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        {/* ✅ Filters */}
        <div className="selecy__duyethp__container">
          {/* Niên khóa */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedNienKhoa}
              onChange={(e) => setSelectedNienKhoa(e.target.value)}
            >
              <option value="">-- Chọn Niên khóa --</option>
              {nienKhoas.map((nk) => (
                <option key={nk} value={nk}>
                  {nk}
                </option>
              ))}
            </select>
          </div>

          {/* Học kỳ */}
          <div className="mr_20">
            <select
              className="form__select w__200"
              value={selectedHocKyId}
              onChange={(e) => setSelectedHocKyId(e.target.value)}
              disabled={!selectedNienKhoa}
            >
              <option value="">-- Chọn Học kỳ --</option>
              {flatHocKys
                .filter((hk) => hk.tenNienKhoa === selectedNienKhoa)
                .map((hk) => (
                  <option key={hk.id} value={hk.id}>
                    {hk.tenHocKy}
                  </option>
                ))}
            </select>
          </div>

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
            <label className="form__floating-label">
              Tìm theo mã/tên môn
            </label>
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
                    {mon.danhSachLop.map((lop:any, idx:any) => (
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
