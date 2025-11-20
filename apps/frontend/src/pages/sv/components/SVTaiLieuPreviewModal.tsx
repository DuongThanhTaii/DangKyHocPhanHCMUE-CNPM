import { useState } from "react";
import type { SVTaiLieuDTO } from "../../../features/sv/types";
import "../../../styles/tailieu-preview.css";

interface Props {
  document: SVTaiLieuDTO;
  fileUrl: string;
  onClose: () => void;
}

export default function SVTaiLieuPreviewModal({
  document,
  fileUrl,
  onClose,
}: Props) {
  const [iframeError, setIframeError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileType = document.fileType?.toLowerCase() || "";
  const isPDF = fileType.includes("pdf");
  const isImage = fileType.includes("image");
  const isDoc = fileType.includes("word") || fileType.includes("msword");

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-container" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{document.tenTaiLieu}</h3>
          <button className="preview-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="preview-body">
          {/* PDF Preview */}
          {isPDF && !iframeError && (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title={document.tenTaiLieu}
              className="preview-iframe"
              onError={() => setIframeError(true)}
            />
          )}

          {/* Image Preview */}
          {isImage && !imageError && (
            <img
              src={fileUrl}
              alt={document.tenTaiLieu}
              className="preview-image"
              onError={() => setImageError(true)}
            />
          )}

          {/* Word/Other files */}
          {(isDoc || (!isPDF && !isImage) || iframeError || imageError) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "16px",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                  fill="#6b7280"
                />
              </svg>
              <p style={{ color: "#6b7280", fontWeight: 600 }}>
                {isDoc
                  ? "📝 File Word không hỗ trợ xem trước"
                  : "⚠️ Không thể xem trước file"}
              </p>
              <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                Vui lòng tải xuống để xem
              </p>
            </div>
          )}
        </div>

        <div className="preview-footer">
          <a
            href={fileUrl}
            download={document.tenTaiLieu}
            className="btn__chung"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⬇️ Tải xuống
          </a>
        </div>
      </div>
    </div>
  );
}
