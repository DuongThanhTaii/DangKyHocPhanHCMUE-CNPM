import { useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useGVLopHocPhanDetail } from "../../features/gv/hooks";
import TaiLieuUpload from "./components/TaiLieuUpload";
import TaiLieuList from "./components/TaiLieuList";

export default function GVLopHocPhanDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"docs" | "sv" | "grades">("docs");

  const {
    info,
    students,
    documents,
    grades,
    loading,
    submitting,
    uploadProgress,
    setGrades,
    uploadMultipleFiles,
    deleteDocument,
    saveGrades,
    getDocumentUrl,
  } = useGVLopHocPhanDetail(id!);

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">
          {info
            ? `QUẢN LÝ LỚP ${info.ma_lop} — ${info.hoc_phan.mon_hoc.ma_mon} ${info.hoc_phan.mon_hoc.ten_mon}`
            : "QUẢN LÝ LỚP HỌC PHẦN"}
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

            {/* Tài liệu */}
            {tab === "docs" && (
              <div>
                <TaiLieuUpload
                  onUpload={uploadMultipleFiles}
                  uploading={submitting}
                  uploadProgress={uploadProgress}
                />

                <TaiLieuList
                  documents={documents}
                  onDelete={deleteDocument}
                  onGetUrl={getDocumentUrl}
                  submitting={submitting}
                  lhpId={id!} // ✅ Pass lhpId
                />
              </div>
            )}

            {/* Sinh viên */}
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
                    {students.map((s) => (
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

            {/* Điểm */}
            {tab === "grades" && (
              <div>
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
                      {students.map((s) => (
                        <tr key={s.id}>
                          {" "}
                          {/* ✅ Use UUID as key */}
                          <td>{s.mssv}</td>
                          <td>{s.hoTen}</td>
                          <td style={{ maxWidth: 120 }}>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={grades[s.id] ?? ""}
                              onChange={(e) =>
                                setGrades((g) => ({
                                  ...g,
                                  // ✅ Use UUID as key
                                  [s.id]:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            Không có sinh viên để nhập điểm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={saveGrades} disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Lưu điểm"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
