import { useRef, useState } from "react";
import "../../../styles/tailieu-upload.css";
import FileNameEditModal from "./FileNameEditModal";

interface Props {
  onUpload: (filesWithNames: { file: File; name: string }[]) => void;
  uploading: boolean;
  uploadProgress: Record<string, number>;
}

export default function TaiLieuUpload({
  onUpload,
  uploading,
  uploadProgress,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // ✅ Files waiting for name edit

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingFiles(files); // ✅ Open modal
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setPendingFiles(files); // ✅ Open modal
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleConfirmUpload = (
    filesWithNames: { file: File; name: string }[]
  ) => {
    onUpload(filesWithNames);
    setPendingFiles([]); // ✅ Close modal
  };

  const handleCancelUpload = () => {
    setPendingFiles([]); // ✅ Close modal
  };

  const progressValues = Object.values(uploadProgress);
  const avgProgress =
    progressValues.length > 0
      ? Math.round(
          progressValues.reduce((a, b) => a + b, 0) / progressValues.length
        )
      : 0;

  return (
    <>
      <div className="tailieu-upload-container">
        <div
          className={`tailieu-dropzone ${dragging ? "dragging" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt,.mp4,.jpg,.jpeg,.png,.zip"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={uploading}
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 10l5-5m0 0l5 5m-5-5v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="dropzone-text">
            {uploading
              ? `Đang upload... ${avgProgress}%`
              : "Kéo thả file hoặc click để chọn"}
          </p>

          <p className="dropzone-hint">
            Hỗ trợ: PDF, DOCX, PPTX, TXT, MP4, JPG, PNG, ZIP (tối đa 100MB/file)
          </p>
        </div>

        {uploading && (
          <div className="upload-progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ✅ Modal chỉnh sửa tên file */}
      {pendingFiles.length > 0 && (
        <FileNameEditModal
          files={pendingFiles}
          onConfirm={handleConfirmUpload}
          onCancel={handleCancelUpload}
        />
      )}
    </>
  );
}
