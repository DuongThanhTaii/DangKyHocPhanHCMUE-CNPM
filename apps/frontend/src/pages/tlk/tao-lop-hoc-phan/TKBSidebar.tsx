import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ClassInstance, TietHoc } from "./TaoThoiKhoaBieuModal";
import type { HocPhanForCreateLopDTO } from "../../../features/tlk/types";
import { usePhongHocTLK } from "../../../features/tlk/hooks";

interface Props {
  danhSachLop: HocPhanForCreateLopDTO[];
  instances: ClassInstance[];
  selectedInstanceId: string | null;
  selectedLopId: string;
  tietHocConfig: TietHoc[];
  onAddInstance: (lopData: HocPhanForCreateLopDTO) => void;
  onSelectInstance: (id: string) => void;
  onUpdateInstance: (id: string, updates: Partial<ClassInstance>) => void;
  onDeleteInstance: (id: string) => void;
  onSelectLop: (lopId: string) => void;
}

export default function TKBSidebar({
  danhSachLop,
  instances,
  selectedInstanceId,
  selectedLopId,
  tietHocConfig,
  onAddInstance,
  onSelectInstance,
  onUpdateInstance,
  onDeleteInstance,
  onSelectLop,
}: Props) {
  const { phongHocs, loading: loadingPhong } = usePhongHocTLK();

  const handleAddClick = () => {
    const lopData = danhSachLop.find((lop) => lop.id === selectedLopId);
    if (lopData) {
      onAddInstance(lopData);
      // ✅ KHÔNG reset selectedLopId
    }
  };

  const selectedInstance = instances.find(
    (inst) => inst.id === selectedInstanceId
  );

  const availableTietKetThuc = selectedInstance?.tietBatDau
    ? tietHocConfig.filter((t) => t.tiet >= selectedInstance.tietBatDau!)
    : tietHocConfig;

  return (
    <div className="tkb-sidebar">
      <div className="tkb-sidebar-section">
        <label className="tkb-label">Chọn lớp học phần</label>
        <select
          className="form__select"
          value={selectedLopId}
          onChange={(e) => onSelectLop(e.target.value)}
        >
          <option value="">-- Chọn học phần --</option>
          {danhSachLop.map((lop) => (
            <option key={lop.id} value={lop.id}>
              {lop.maHocPhan} - {lop.tenHocPhan}
            </option>
          ))}
        </select>
        {/* Hiển thị số sinh viên ghi danh */}
        {selectedLopId && (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#0c4874",
              background: "#f3f4f6",
              borderRadius: 6,
              padding: "4px 10px",
              display: "inline-block",
              fontWeight: 500,
            }}
          >
            Số sinh viên ghi danh:{" "}
            <span style={{ color: "#2563eb", fontWeight: 700 }}>
              {danhSachLop.find((lop) => lop.id === selectedLopId)
                ?.soSinhVienGhiDanh ?? 0}
            </span>
          </div>
        )}
        <button
          className="btn__add-instance"
          onClick={handleAddClick}
          disabled={!selectedLopId}
        >
          + Thêm buổi học
        </button>
      </div>

      {selectedLopId && instances.length > 0 && (
        <div className="tkb-sidebar-section">
          <label className="tkb-label">Các buổi học ({instances.length})</label>
          <div className="tkb-instance-list">
            {instances.map((instance, idx) => (
              <DraggableInstance
                key={instance.id}
                instance={instance}
                index={idx}
                isSelected={instance.id === selectedInstanceId}
                onSelect={() => onSelectInstance(instance.id)}
                onDelete={() => onDeleteInstance(instance.id)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedInstance && (
        <div className="tkb-sidebar-section">
          <label className="tkb-label">Thông tin buổi học</label>

          {/* Tiết bắt đầu */}
          <div className="tkb-form-group">
            <label>Tiết bắt đầu</label>
            <select
              className="form__select"
              value={selectedInstance.tietBatDau || ""}
              onChange={(e) =>
                onUpdateInstance(selectedInstance.id, {
                  tietBatDau: Number(e.target.value),
                })
              }
            >
              <option value="">Chọn tiết</option>
              {tietHocConfig.map((t) => (
                <option key={t.tiet} value={t.tiet}>
                  Tiết {t.tiet} ({t.label})
                </option>
              ))}
            </select>
          </div>

          {/* Tiết kết thúc */}
          <div className="tkb-form-group">
            <label>Tiết kết thúc</label>
            <select
              className="form__select"
              value={selectedInstance.tietKetThuc || ""}
              onChange={(e) =>
                onUpdateInstance(selectedInstance.id, {
                  tietKetThuc: Number(e.target.value),
                })
              }
              disabled={!selectedInstance.tietBatDau}
            >
              <option value="">Chọn tiết</option>
              {availableTietKetThuc.map((t) => (
                <option key={t.tiet} value={t.tiet}>
                  Tiết {t.tiet} ({t.label})
                </option>
              ))}
            </select>
          </div>

          {/* Phòng học */}
          <div className="tkb-form-group">
            <label>Phòng học</label>
            {loadingPhong ? (
              <div className="form__loading">Đang tải phòng học...</div>
            ) : (
              <select
                className="form__select"
                value={selectedInstance.phongHocId || ""}
                onChange={(e) => {
                  const selectedPhongId = e.target.value;
                  const selectedPhong = phongHocs.find(
                    (p) => p.id === selectedPhongId
                  );

                  console.log("Selected phong:", selectedPhong); // ✅ Debug

                  onUpdateInstance(selectedInstance.id, {
                    phongHocId: selectedPhongId,
                    tenPhongHoc: selectedPhong
                      ? `${selectedPhong.maPhong} - ${selectedPhong.tenCoSo}`
                      : "",
                  });
                }}
              >
                <option value="">-- Chọn phòng --</option>
                {phongHocs.map((phong) => (
                  <option key={phong.id} value={phong.id}>
                    {phong.maPhong} - {phong.tenCoSo} (SL: {phong.sucChua})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ngày bắt đầu */}
          <div className="tkb-form-group">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              className="form__input"
              value={selectedInstance.ngayBatDau || ""}
              onChange={(e) =>
                onUpdateInstance(selectedInstance.id, {
                  ngayBatDau: e.target.value,
                })
              }
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="tkb-form-group">
            <label>Ngày kết thúc</label>
            <input
              type="date"
              className="form__input"
              value={selectedInstance.ngayKetThuc || ""}
              onChange={(e) =>
                onUpdateInstance(selectedInstance.id, {
                  ngayKetThuc: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ...existing DraggableInstance component...
interface DraggableInstanceProps {
  instance: ClassInstance;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function DraggableInstance({
  instance,
  index,
  isSelected,
  onSelect,
  onDelete,
}: DraggableInstanceProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: instance.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isComplete = !!(
    instance.tietBatDau &&
    instance.tietKetThuc &&
    instance.phongHocId && // ✅ Đổi từ phongHoc → phongHocId
    instance.ngayBatDau &&
    instance.ngayKetThuc
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tkb-instance-item ${isSelected ? "selected" : ""} ${
        !isComplete ? "incomplete" : ""
      }`}
    >
      <span className="tkb-instance-drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </span>
      <div className="tkb-instance-content" onClick={onSelect}>
        <div className="tkb-instance-index">
          Buổi {index + 1}: {instance.maLopHP}
        </div>
        <div className="tkb-instance-position">
          {instance.position
            ? `Thứ ${instance.position.thu}, Tiết ${instance.position.tiet}`
            : "Chưa xếp lịch"}
        </div>
        {/* ✅ Hiển thị tên phòng nếu có */}
        {instance.tenPhongHoc && (
          <div className="tkb-instance-room"> {instance.tenPhongHoc}</div>
        )}
      </div>
      <button className="tkb-instance-delete" onClick={onDelete}>
        ✕
      </button>
    </div>
  );
}
