// src/pages/sv/SVLopHocPhanDetail.tsx
import { useParams } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useGVLopHocPhanDetail } from "../../features/gv/hooks";
import SVTaiLieuList from "./components/SVTaiLieuList";

export default function SVLopHocPhanDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    info: lopHocPhan,
    documents,
    loading,
    getDocumentUrl,
  } = useGVLopHocPhanDetail(id || "");

  if (loading) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">TÀI LIỆU LỚP HỌC PHẦN</p>
        </div>
        <div className="body__inner">
          <p style={{ textAlign: "center", padding: 40 }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </section>
    );
  }

  if (!lopHocPhan) {
    return (
      <section className="main__body">
        <div className="body__title">
          <p className="body__title-text">TÀI LIỆU LỚP HỌC PHẦN</p>
        </div>
        <div className="body__inner">
          <p style={{ textAlign: "center", padding: 40, color: "#dc2626" }}>
            ❌ Không tìm thấy lớp học phần
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">TÀI LIỆU LỚP HỌC PHẦN</p>
      </div>

      <div className="body__inner">
        {/* ✅ Thông tin lớp học phần */}
        <div
          className="form-section"
          style={{
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <h3 className="sub__title_chuyenphase">
            {lopHocPhan.ma_lop} - {lopHocPhan.hoc_phan.ten_hoc_phan}
          </h3>
          <div style={{ marginTop: "12px", color: "#6b7280" }}>
            <p>
              <strong>Môn học:</strong> {lopHocPhan.hoc_phan.mon_hoc.ma_mon} -{" "}
              {lopHocPhan.hoc_phan.mon_hoc.ten_mon}
            </p>
          </div>
        </div>

        {/* ✅ Danh sách tài liệu (READ-ONLY) */}
        <div className="form-section">
          <h3 className="sub__title_chuyenphase">📚 Tài liệu học tập</h3>
          <SVTaiLieuList
            documents={documents}
            onGetUrl={getDocumentUrl}
            lhpId={id || ""}
          />
        </div>
      </div>
    </section>
  );
}
