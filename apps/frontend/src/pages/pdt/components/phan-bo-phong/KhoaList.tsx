import type { KhoaDTO } from "../../../../features/pdt/types/pdtTypes";

interface Props {
  khoas: KhoaDTO[];
  selectedKhoaId: string;
  onSelectKhoa: (khoaId: string) => void;
  loading: boolean;
}

export default function KhoaList({
  khoas,
  selectedKhoaId,
  onSelectKhoa,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="khoa-list-sidebar">
        <div className="khoa-list-header">
          <h3>Danh Sách Khoa</h3>
        </div>
        <div className="khoa-list-loading">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="khoa-list-sidebar">
      <div className="khoa-list-header">
        <h3>Danh Sách Khoa</h3>
        <span className="khoa-count">{khoas.length} khoa</span>
      </div>

      <div className="khoa-list-content">
        {khoas.length === 0 ? (
          <div className="khoa-list-empty">
            <p>Không có khoa nào</p>
          </div>
        ) : (
          khoas.map((khoa) => (
            <div
              key={khoa.id}
              className={`khoa-item ${
                khoa.id === selectedKhoaId ? "active" : ""
              }`}
              onClick={() => onSelectKhoa(khoa.id)}
            >
              <div className="khoa-item-name">{khoa.tenKhoa}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
