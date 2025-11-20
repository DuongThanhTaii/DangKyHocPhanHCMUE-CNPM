import { useState } from "react";
import type { GVDocumentDTO } from "../../../features/gv/api/gvLopHocPhanAPI";
import { gvLopHocPhanAPI } from "../../../features/gv/api/gvLopHocPhanAPI";
import TaiLieuPreviewModal from "./TaiLieuPreviewModal";
import "../../../styles/tailieu-list.css";

interface Props {
  documents: GVDocumentDTO[];
  onDelete: (docId: string) => void;
  onGetUrl: (docId: string) => Promise<string | null>;
  submitting: boolean;
  lhpId: string; // ✅ Add lhpId
}

export default function TaiLieuList({
  documents,
  onDelete,
  onGetUrl,
  submitting,
  lhpId,
}: Props) {
  const [previewDoc, setPreviewDoc] = useState<GVDocumentDTO | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // ✅ Check if file can be previewed based on file_type
  const canPreview = (doc: GVDocumentDTO) => {
    const previewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    return doc.file_type && previewableTypes.includes(doc.file_type);
  };

  // ✅ Get file icon based on file_type
  const getFileIcon = (doc: GVDocumentDTO) => {
    const type = doc.file_type?.toLowerCase() || "";

    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("msword")) return "📝";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📊";
    if (type.includes("text")) return "📃";
    if (type.includes("video")) return "🎥";
    if (type.includes("image")) return "🖼️";
    if (type.includes("zip") || type.includes("compressed")) return "📦";

    return "📎";
  };

  const handlePreview = async (doc: GVDocumentDTO) => {
    setLoadingUrl(true);
    const url = await onGetUrl(doc.id);
    setLoadingUrl(false);

    if (url) {
      setPreviewDoc(doc);
      setPreviewUrl(url);
    }
  };

  const handleDownload = async (doc: GVDocumentDTO) => {
    try {
      // ✅ Download via backend proxy
      const blob = await gvLopHocPhanAPI.downloadTaiLieu(lhpId, doc.id);

      if (blob) {
        // ✅ Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.ten_tai_lieu;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  // ✅ Cleanup blob URLs
  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  return (
    <>
      <div className="tailieu-list">
        {documents.length === 0 && (
          <div className="tailieu-empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                fill="#94A3B8"
              />
            </svg>
            <p>Chưa có tài liệu nào</p>
          </div>
        )}

        {documents.map((doc) => (
          <div key={doc.id} className="tailieu-item">
            <div className="tailieu-icon">{getFileIcon(doc)}</div>

            <div className="tailieu-info">
              <div className="tailieu-name">{doc.ten_tai_lieu}</div>
              <div className="tailieu-meta">
                {doc.created_at &&
                  new Date(doc.created_at).toLocaleDateString("vi-VN")}
                {doc.file_type && (
                  <span className="tailieu-type">
                    {" • "}
                    {doc.file_type.split("/")[1]?.toUpperCase() || "FILE"}
                  </span>
                )}
              </div>
            </div>

            <div className="tailieu-actions">
              {canPreview(doc) && (
                <button
                  className="btn-preview"
                  onClick={() => handlePreview(doc)}
                  disabled={loadingUrl}
                  title="Xem trước"
                >
                  {loadingUrl ? "⏳" : "👁️"}
                </button>
              )}

              <button
                className="btn-download"
                onClick={() => handleDownload(doc)}
                disabled={loadingUrl}
                title="Tải xuống"
              >
                ⬇️
              </button>

              <button
                className="btn-delete"
                onClick={() => onDelete(doc.id)}
                disabled={submitting}
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewDoc && previewUrl && (
        <TaiLieuPreviewModal
          document={previewDoc}
          fileUrl={previewUrl}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
}
