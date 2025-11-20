import { useState } from "react";
import type { SVTaiLieuDTO } from "../../../features/sv/types";
import { svApi } from "../../../features/sv/api/svApi";
import SVTaiLieuPreviewModal from "./SVTaiLieuPreviewModal";
import "../../../styles/tailieu-list.css";

interface Props {
  documents: SVTaiLieuDTO[];
  lhpId: string;
}

export default function SVTaiLieuList({ documents, lhpId }: Props) {
  const [previewDoc, setPreviewDoc] = useState<SVTaiLieuDTO | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // Check if file can be previewed based on fileType
  const canPreview = (doc: SVTaiLieuDTO) => {
    const previewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    return doc.fileType && previewableTypes.includes(doc.fileType);
  };

  // Get file icon based on fileType
  const getFileIcon = (doc: SVTaiLieuDTO) => {
    const type = doc.fileType?.toLowerCase() || "";

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

  const handlePreview = async (doc: SVTaiLieuDTO) => {
    setLoadingUrl(true);
    // Use fileUrl directly from API response
    setPreviewDoc(doc);
    setPreviewUrl(doc.fileUrl);
    setLoadingUrl(false);
  };

  const handleDownload = async (doc: SVTaiLieuDTO) => {
    try {
      // Download via backend proxy
      const blob = await svApi.downloadTaiLieu(lhpId, doc.id);

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.tenTaiLieu;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

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
              <div className="tailieu-name">{doc.tenTaiLieu}</div>
              <div className="tailieu-meta">
                {doc.uploadedAt &&
                  new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                {doc.fileType && (
                  <span className="tailieu-type">
                    {" • "}
                    {doc.fileType.split("/")[1]?.toUpperCase() || "FILE"}
                  </span>
                )}
              </div>
            </div>

            {/* SV chỉ có preview + download, KHÔNG có delete */}
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
            </div>
          </div>
        ))}
      </div>

      {previewDoc && previewUrl && (
        <SVTaiLieuPreviewModal
          document={previewDoc}
          fileUrl={previewUrl}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
}
