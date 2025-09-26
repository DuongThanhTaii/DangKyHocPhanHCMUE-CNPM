import React, { useEffect, useState } from "react";
import api from "../../utils/api";

type KPI = {
  tong_sinh_vien: number;
  tong_lop_hp: number;
  tong_hoc_phan: number;
  tong_dang_ky: number;
};

export default function ThongKeDashboard() {
  const [kpi, setKpi] = useState<KPI>({
    tong_sinh_vien: 0,
    tong_lop_hp: 0,
    tong_hoc_phan: 0,
    tong_dang_ky: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<KPI>("/pdt/thong-ke");
        setKpi(res.data);
      } catch (e) {
        // demo
      }
    })();
  }, []);

  return (
    <div className="card">
      <h2>Thống kê dữ liệu</h2>
      <div className="kpi-grid">
        <div className="kpi">
          <h3>{kpi.tong_sinh_vien}</h3>
          <p>Sinh viên</p>
        </div>
        <div className="kpi">
          <h3>{kpi.tong_hoc_phan}</h3>
          <p>Học phần</p>
        </div>
        <div className="kpi">
          <h3>{kpi.tong_lop_hp}</h3>
          <p>Lớp học phần</p>
        </div>
        <div className="kpi">
          <h3>{kpi.tong_dang_ky}</h3>
          <p>Lượt đăng ký</p>
        </div>
      </div>
    </div>
  );
}
