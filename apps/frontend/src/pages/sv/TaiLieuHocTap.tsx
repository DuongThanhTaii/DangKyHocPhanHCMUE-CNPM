import { useState } from "react";
import { useSVTaiLieu } from "../../features/sv/hooks/useSVTaiLieu";
import SVTaiLieuList from "./components/SVTaiLieuList";
import HocKySelector from "../../components/HocKySelector";
import type { LopDaDangKyWithTaiLieuDTO } from "../../features/sv/types";

export default function TaiLieuHocTap() {
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  const {
    lopDaDangKy,
    selectedLop,
    taiLieu,
    loading,
    error,
    selectLop,
  } = useSVTaiLieu(selectedHocKyId || null);

  const handleHocKyChange = (hocKyId: string) => {
    setSelectedHocKyId(hocKyId);
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          📚 Tài liệu học tập
        </h1>
        <p style={{ color: "#6b7280" }}>
          Xem và tải tài liệu học tập của các môn đã đăng ký
        </p>
      </div>

      {/* Học kỳ selector */}
      <div style={{ marginBottom: "24px" }}>
        <HocKySelector onHocKyChange={handleHocKyChange} />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            marginBottom: "16px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#6b7280" }}>⏳ Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Main content - 2 columns layout */}
      {!loading && selectedHocKyId && (
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          {/* Left column - Danh sách lớp */}
          <div
            style={{
              flex: "0 0 350px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "16px",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Lớp học phần đã đăng ký
            </h2>

            {lopDaDangKy.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                Chưa có lớp nào được đăng ký
              </p>
            )}

            {lopDaDangKy.map((lop: LopDaDangKyWithTaiLieuDTO) => (
              <div
                key={lop.lopHocPhanId}
                onClick={() => selectLop(lop)}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedLop?.lopHocPhanId === lop.lopHocPhanId
                      ? "#dbeafe"
                      : "#f9fafb",
                  border:
                    selectedLop?.lopHocPhanId === lop.lopHocPhanId
                      ? "2px solid #3b82f6"
                      : "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedLop?.lopHocPhanId !== lop.lopHocPhanId) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLop?.lopHocPhanId !== lop.lopHocPhanId) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1f2937",
                        marginBottom: "4px",
                      }}
                    >
                      {lop.tenMon}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {lop.maMon} - {lop.maLop}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      👨‍🏫 {lop.giangVien}
                    </div>
                  </div>

                  {/* Badge số tài liệu */}
                  {lop.taiLieu.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        borderRadius: "12px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        minWidth: "24px",
                        textAlign: "center",
                      }}
                    >
                      {lop.taiLieu.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right column - Danh sách tài liệu */}
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "16px",
              minHeight: "400px",
            }}
          >
            {selectedLop ? (
              <>
                <div
                  style={{
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
                    {selectedLop.tenMon}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>
                    {selectedLop.maMon} - {selectedLop.maLop} ({" "}
                    {selectedLop.soTinChi} TC)
                  </p>
                </div>

                <SVTaiLieuList
                  documents={taiLieu}
                  lhpId={selectedLop.lopHocPhanId}
                />
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "400px",
                  color: "#9ca3af",
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginBottom: "16px" }}
                >
                  <path
                    d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                    fill="#d1d5db"
                  />
                </svg>
                <p>Chọn một lớp để xem tài liệu</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No học kỳ selected */}
      {!loading && !selectedHocKyId && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ color: "#6b7280" }}>
            Vui lòng chọn học kỳ để xem tài liệu
          </p>
        </div>
      )}
    </div>
  );
}
