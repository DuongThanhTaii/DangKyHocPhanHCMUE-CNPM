import type {
  KhoaDTO,
  PhongHocDTO,
} from "../../../../features/pdt/types/pdtTypes";

interface Props {
  khoa?: KhoaDTO;
  phongHocs: PhongHocDTO[];
  loading: boolean;
  submitting: boolean;
  onOpenThemPhong: () => void;
  onRemovePhong: (phongId: string) => void;
}

export default function PhongHocList({
  khoa,
  phongHocs,
  loading,
  submitting,
  onOpenThemPhong,
  onRemovePhong,
}: Props) {
  if (!khoa) {
    return (
      <div className="phong-hoc-main">
        <div className="phong-hoc-empty-state">
          <p>Chọn khoa để xem phòng học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phong-hoc-main">
      <div className="phong-hoc-header">
        <div className="phong-hoc-title">
          <h2>Khoa {khoa.tenKhoa}</h2>
        </div>
        <button
          className="btn-them-phong"
          onClick={onOpenThemPhong}
          disabled={submitting}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3.33334V12.6667M3.33334 8H12.6667"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Thêm Phòng
        </button>
      </div>

      {loading ? (
        <div className="phong-hoc-loading">
          <p>Đang tải phòng học...</p>
        </div>
      ) : phongHocs.length === 0 ? (
        <div className="phong-hoc-empty">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 16V24M24 32H24.02"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Chưa có phòng học nào</p>
          <button className=" btn__chung" onClick={onOpenThemPhong}>
            Thêm phòng học đầu tiên
          </button>
        </div>
      ) : (
        <div className="phong-hoc-grid">
          {phongHocs.map((phong) => (
            <div key={phong.id} className="phong-hoc-card">
              <div className="phong-hoc-card-header">
                <div className="phong-ma">{phong.maPhong}</div>
                <button
                  className="btn-remove-phong"
                  onClick={() => onRemovePhong(phong.id)}
                  disabled={submitting}
                  title="Xóa phòng khỏi khoa"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="phong-hoc-card-body">
                <div className="phong-info-row">
                  <span className="phong-label">Cơ sở:</span>
                  <span className="phong-value">{phong.tenCoSo}</span>
                </div>
                <div className="phong-info-row">
                  <span className="phong-label">Sức chứa:</span>
                  <span className="phong-value phong-suc-chua">
                    {phong.sucChua} sinh viên
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
