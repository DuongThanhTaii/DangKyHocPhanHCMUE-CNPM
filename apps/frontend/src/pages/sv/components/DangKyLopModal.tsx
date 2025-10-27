import { Fragment } from "react";
import type {
  MonHocInfoDTO,
  LopHocPhanItemDTO,
} from "../../../features/sv/types";
import "../../../styles/modal.css";

interface Props {
  monHoc: MonHocInfoDTO;
  onClose: () => void;
  onDangKy: (lopId: string) => void;
  isDaDangKy: (lopId: string) => boolean;
}

export default function DangKyLopModal({
  monHoc,
  onClose,
  onDangKy,
  isDaDangKy,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3>
            Chọn lớp học phần - {monHoc.tenMon} ({monHoc.maMon})
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
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
              {monHoc.danhSachLop.map(
                (lop: LopHocPhanItemDTO, index: number) => {
                  const daDangKy = isDaDangKy(lop.id);
                  return (
                    <tr
                      key={lop.id}
                      className={daDangKy ? "row__highlight" : ""}
                    >
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
                          disabled={daDangKy}
                          onClick={() => onDangKy(lop.id)}
                        >
                          {daDangKy ? "Đã đăng ký" : "Đăng ký"}
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
