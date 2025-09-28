import React, { useEffect, useState } from "react";
import api from "../../utils/api";

type TrangThai = "DRAFT" | "DA_GUI_PDT" | "PDT_DA_DUYET" | "PDT_TU_CHOI";

type DeXuatRow = {
  id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  so_nhom: number;
  si_so_du_kien: number;
  trang_thai: TrangThai;
};

const statusLabel: Record<TrangThai, string> = {
  DRAFT: "Nháp",
  DA_GUI_PDT: "Đã gửi PĐT",
  PDT_DA_DUYET: "PĐT đã duyệt",
  PDT_TU_CHOI: "PĐT từ chối",
};

const DuyetHocPhan: React.FC = () => {
  const [rows, setRows] = useState<DeXuatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // TODO: đổi endpoint theo BE
        const res = await api.get<DeXuatRow[]>("/tlk/de-xuat-hoc-phan");
        setRows(res.data || []);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const guiPDT = async () => {
    // Gửi toàn bộ bản nháp lên PĐT
    await api.post("/tlk/gui-pdt");
    const res = await api.get<DeXuatRow[]>("/tlk/de-xuat-hoc-phan");
    setRows(res.data || []);
  };

  if (loading)
    return (
      <div className="card">
        <p>Đang tải…</p>
      </div>
    );

  return (
    <div className="card">
      <h2>Duyệt danh sách học phần (Trợ lý khoa)</h2>
      {rows.length === 0 ? (
        <p>Chưa có đề xuất nào.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên môn</th>
                <th>TC</th>
                <th>Số nhóm</th>
                <th>Sĩ số/nhóm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.ma_mon}</td>
                  <td>{r.ten_mon}</td>
                  <td>{r.so_tin_chi}</td>
                  <td>{r.so_nhom}</td>
                  <td>{r.si_so_du_kien}</td>
                  <td>{statusLabel[r.trang_thai]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={guiPDT}>
              Gửi toàn bộ bản nháp lên PĐT
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DuyetHocPhan;
