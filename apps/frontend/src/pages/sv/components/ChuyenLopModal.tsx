import { useEffect } from "react";
import type { LopHocPhanItemDTO } from "../../../features/sv/types";
import "../../../styles/modal.css";

interface Props {
  lopCu: {
    lopId: string;
    monHocId: string;
    maMon: string;
    tenMon: string;
    tenLop: string;
  };
  danhSachLopMoi: LopHocPhanItemDTO[];
  loading: boolean;
  onClose: () => void;
  onChuyenLop: (lopMoiId: string) => void;
}

export default function ChuyenLopModal({
  lopCu,
  danhSachLopMoi,
  loading,
  onClose,
  onChuyenLop,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            Chuyển lớp - {lopCu.tenMon} ({lopCu.maMon})
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: 16, color: "#666" }}>
            <strong>Lớp hiện tại:</strong> {lopCu.tenLop}
          </p>

          {loading ? (
            <p style={{ textAlign: "center", padding: 20 }}>Đang tải...</p>
          ) : danhSachLopMoi.length === 0 ? (
            <p style={{ textAlign: "center", padding: 20, color: "#999" }}>
              Không có lớp nào khác để chuyển
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã lớp</th>
                  <th>Tên lớp</th>
                  <th>SL</th>
                  <th>TKB</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSachLopMoi.map((lop, index) => (
                  <tr key={lop.id}>
                    <td>{index + 1}</td>
                    <td>{lop.maLop}</td>
                    <td>{lop.tenLop}</td>
                    <td>
                      {lop.soLuongHienTai}/{lop.soLuongToiDa}
                    </td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {lop.tkb.map((t, i) => (
                        <div key={i}>{t.formatted}</div>
                      ))}
                    </td>
                    <td>
                      <button
                        className="btn__chung"
                        style={{ padding: "5px 10px", fontSize: "14px" }}
                        onClick={() => onChuyenLop(lop.id)}
                        disabled={lop.soLuongHienTai >= lop.soLuongToiDa}
                      >
                        {lop.soLuongHienTai >= lop.soLuongToiDa
                          ? "Đã đầy"
                          : "Chuyển"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
