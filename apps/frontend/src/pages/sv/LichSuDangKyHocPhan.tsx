import { useState, useEffect, useMemo } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useHocKyHienHanh } from "../../features/common/hooks";
import { useHocKyNienKhoa } from "../../features/common/hooks";
import { useLichSuDangKy } from "../../features/sv/hooks";
import type { HocKyItemDTO } from "../../features/common/types";
import HocKySelector from "../../components/HocKySelector";

export default function LichSuDangKy() {
  const { data: hocKyHienHanh, loading: loadingHocKyHienHanh } =
    useHocKyHienHanh();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();

  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  // ✅ Flatten data - Niên khóa list
  const nienKhoas = useMemo(
    () => Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))),
    [hocKyNienKhoas]
  );

  // ✅ Flatten data - Học kỳ list
  const flatHocKys = useMemo(() => {
    const result: (HocKyItemDTO & { tenNienKhoa: string })[] = [];

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

  // ✅ Auto-select học kỳ hiện hành ONLY on mount (once)
  useEffect(() => {
    // Only run if both data loaded AND no selection made yet
    if (
      loadingHocKyHienHanh ||
      loadingHocKy ||
      !hocKyHienHanh ||
      flatHocKys.length === 0
    ) {
      return;
    }

    // ✅ Only auto-select if BOTH fields are empty (first load)
    if (selectedHocKyId || selectedNienKhoa) {
      return;
    }

    const hkHienHanh = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

    if (hkHienHanh) {
      setSelectedNienKhoa(hkHienHanh.tenNienKhoa);
      setSelectedHocKyId(hkHienHanh.id);
    }
    // ✅ Remove selectedHocKyId from dependencies to prevent re-running
  }, [
    hocKyHienHanh,
    flatHocKys,
    loadingHocKyHienHanh,
    loadingHocKy,
    selectedNienKhoa,
  ]);

  // ✅ Reset học kỳ khi đổi niên khóa
  useEffect(() => {
    setSelectedHocKyId("");
  }, [selectedNienKhoa]);

  // ✅ Fetch lịch sử đăng ký
  const { data: lichSuData, loading: loadingLichSu } =
    useLichSuDangKy(selectedHocKyId);

  // ✅ Format datetime
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ✅ Format action
  const getActionLabel = (action: string) => {
    return action === "dang_ky" ? "Đăng ký" : "Hủy đăng ký";
  };

  const getActionColor = (action: string) => {
    return action === "dang_ky" ? "#16a34a" : "#dc2626";
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">LỊCH SỬ ĐĂNG KÝ HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        {/* Filters */}
        <div className="selecy__duyethp__container">
          <HocKySelector onHocKyChange={setSelectedHocKyId} />
        </div>

        {/* Table */}
        {loadingHocKyHienHanh || loadingHocKy ? (
          <p style={{ textAlign: "center", padding: 40 }}>
            Đang tải dữ liệu...
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Thao tác</th>
                <th>Thời gian</th>
                <th>Mã HP</th>
                <th>Tên HP</th>
                <th>Mã lớp</th>
                <th>STC</th>
              </tr>
            </thead>
            <tbody>
              {loadingLichSu ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    Đang tải lịch sử...
                  </td>
                </tr>
              ) : !lichSuData || lichSuData.lichSu.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    {selectedHocKyId
                      ? "Chưa có lịch sử đăng ký"
                      : "Vui lòng chọn học kỳ"}
                  </td>
                </tr>
              ) : (
                lichSuData.lichSu.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        style={{
                          color: getActionColor(item.hanhDong),
                          fontWeight: 600,
                        }}
                      >
                        {getActionLabel(item.hanhDong)}
                      </span>
                    </td>
                    <td>{formatDateTime(item.thoiGian)}</td>
                    <td>{item.monHoc.maMon}</td>
                    <td>{item.monHoc.tenMon}</td>
                    <td>{item.lopHocPhan.maLop}</td>
                    <td>{item.monHoc.soTinChi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Footer info */}
        {lichSuData && (
          <div style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>
            <p>
              <strong>Học kỳ:</strong> {lichSuData.hocKy.tenHocKy} (
              {lichSuData.hocKy.maHocKy})
            </p>
            <p>
              <strong>Ngày tạo:</strong> {formatDateTime(lichSuData.ngayTao)}
            </p>
            <p>
              <strong>Tổng số thao tác:</strong> {lichSuData.lichSu.length}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
