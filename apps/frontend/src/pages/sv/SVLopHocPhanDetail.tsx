// src/pages/sv/SVLopHocPhanDetail.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
// ❗️Ưu tiên dùng hook riêng cho SV (chỉ fetch, không mutate)
import { useGVLopHocPhanDetail } from "../../features/gv/hooks";
// Nếu muốn tái dùng list có sẵn:
import TaiLieuList from "../gv/components/TaiLieuList";

export default function SVLopHocPhanDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"docs" | "sv" | "grades">("docs");

  const {
    info,
    students,
    documents,
    grades, // { [sinhVienId: string]: number }
    loading,
    getDocumentUrl, // (doc: { id: string, ...}) => Promise<string> | string
  } = useGVLopHocPhanDetail(id!);

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">
          {info
            ? `LỚP ${info.ma_lop} — ${info.hoc_phan.mon_hoc.ma_mon} ${info.hoc_phan.mon_hoc.ten_mon}`
            : "LỚP HỌC PHẦN"}
        </p>
      </div>

      <div className="body__inner">
        {loading && (
          <p style={{ textAlign: "center", padding: 20 }}>
            Đang tải dữ liệu...
          </p>
        )}

        {!loading && info && (
          <>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button
                className={tab === "docs" ? "active" : ""}
                onClick={() => setTab("docs")}
              >
                Tài liệu
              </button>
              <button
                className={tab === "sv" ? "active" : ""}
                onClick={() => setTab("sv")}
              >
                Sinh viên
              </button>
              <button
                className={tab === "grades" ? "active" : ""}
                onClick={() => setTab("grades")}
              >
                Điểm
              </button>
            </div>

            {/* ========== TÀI LIỆU (READ-ONLY) ========== */}
            {tab === "docs" && (
              <div>
                <TaiLieuList
                  documents={documents}
                  onGetUrl={getDocumentUrl}
                  submitting={false}
                  lhpId={id!}
                  onDelete={() => {}}
                />
              </div>
            )}

            {/* ========== SINH VIÊN (READ-ONLY) ========== */}
            {tab === "sv" && (
              <div className="table__wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Lớp</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s: any) => (
                      <tr key={s.mssv}>
                        <td>{s.mssv}</td>
                        <td>{s.hoTen}</td>
                        <td>{s.lop || ""}</td>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ textAlign: "center", padding: 20 }}
                        >
                          Chưa có sinh viên đăng ký.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========== ĐIỂM (READ-ONLY) ========== */}
            {tab === "grades" && (
              <div className="table__wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s: any) => (
                      <tr key={s.id /* UUID */}>
                        <td>{s.mssv}</td>
                        <td>{s.hoTen}</td>
                        <td style={{ maxWidth: 120 }}>
                          {/* ❌ KHÔNG cho nhập, chỉ hiển thị */}
                          {grades[s.id] ?? ""}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "center", padding: 20 }}
                        >
                          Chưa có dữ liệu điểm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* ❌ KHÔNG có nút Lưu điểm cho sinh viên */}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
