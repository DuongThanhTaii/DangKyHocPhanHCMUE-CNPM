import { useState, useEffect } from "react";
import "../../../styles/tailieu-preview.css";

interface FileWithName {
  file: File;
  displayName: string;
}

interface Props {
  files: File[];
  onConfirm: (filesWithNames: { file: File; name: string }[]) => void;
  onCancel: () => void;
}

export default function FileNameEditModal({
  files,
  onConfirm,
  onCancel,
}: Props) {
  const [filesWithNames, setFilesWithNames] = useState<FileWithName[]>([]);

  useEffect(() => {
    // ✅ Init with original file names (without extension)
    const init = files.map((file) => ({
      file,
      displayName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
    }));
    setFilesWithNames(init);
  }, [files]);

  const handleNameChange = (index: number, newName: string) => {
    setFilesWithNames((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, displayName: newName } : item
      )
    );
  };

  const handleConfirm = () => {
    const result = filesWithNames.map((item) => ({
      file: item.file,
      name: item.displayName.trim() || item.file.name, // Fallback to original name
    }));
    onConfirm(result);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const icons: Record<string, string> = {
      pdf: "📄",
      docx: "📝",
      pptx: "📊",
      txt: "📃",
      mp4: "🎥",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      zip: "📦",
    };
    return icons[ext || ""] || "📎";
  };

  return (
    <div className="preview-overlay" onClick={onCancel}>
      <div
        className="preview-container"
        style={{ maxWidth: "700px", maxHeight: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-header">
          <h3>📝 Đặt tên cho {files.length} file</h3>
          <button className="preview-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div
          className="preview-body"
          style={{ padding: "20px", overflow: "auto" }}
        >
          {filesWithNames.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "16px",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "24px" }}>
                  {getFileIcon(item.file.name)}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    File gốc: {item.file.name}
                  </div>
                  <input
                    type="text"
                    value={item.displayName}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Nhập tên hiển thị..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="preview-footer"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "16px 24px",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button className="btn__chung" onClick={handleConfirm}>
            ✅ Xác nhận upload
          </button>
        </div>
      </div>
    </div>
  );
}
