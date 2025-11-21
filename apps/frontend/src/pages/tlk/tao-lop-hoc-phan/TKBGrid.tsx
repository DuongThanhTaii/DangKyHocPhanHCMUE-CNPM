import { useDroppable } from "@dnd-kit/core";
import type { ClassInstance, TietHoc } from "./TaoThoiKhoaBieuModal";
import TKBClassCard from "./TKBClassCard";

interface Props {
  instances: ClassInstance[];
  tietHocConfig: TietHoc[];
  selectedInstanceId: string | null;
}

export default function TKBGrid({
  instances,
  tietHocConfig,
  selectedInstanceId,
}: Props) {
  const weekDays = [
    { label: "Thứ 2", value: 2 },
    { label: "Thứ 3", value: 3 },
    { label: "Thứ 4", value: 4 },
    { label: "Thứ 5", value: 5 },
    { label: "Thứ 6", value: 6 },
    { label: "Thứ 7", value: 7 },
    { label: "Chủ nhật", value: 8 },
  ];

  const placedInstances = instances.filter((inst) => inst.position);

  return (
    <div className="tkb-grid-container">
      <table className="tkb-grid">
        <thead>
          <tr>
            <th className="tkb-grid-header-tiet">Tiết</th>
            {weekDays.map((day) => (
              <th key={day.value}>{day.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tietHocConfig.map((tiet) => (
            <tr key={tiet.tiet}>
              <td className="tkb-grid-tiet">
                <div className="tkb-tiet-info">
                  <strong>Tiết {tiet.tiet}</strong>
                  <small>{tiet.label}</small>
                </div>
              </td>
              {weekDays.map((day) => {
                const instanceInCell = placedInstances.find(
                  (inst) =>
                    inst.position?.thu === day.value &&
                    inst.tietBatDau &&
                    inst.tietKetThuc &&
                    tiet.tiet >= inst.tietBatDau &&
                    tiet.tiet <= inst.tietKetThuc
                );

                const shouldRender =
                  instanceInCell && instanceInCell.tietBatDau === tiet.tiet;

                if (instanceInCell && !shouldRender) {
                  return null;
                }

                const rowSpan = shouldRender
                  ? instanceInCell.tietKetThuc! - instanceInCell.tietBatDau! + 1
                  : 1;

                return (
                  <DroppableCell
                    key={`${day.value}-${tiet.tiet}`}
                    thu={day.value}
                    tiet={tiet.tiet}
                    instance={shouldRender ? instanceInCell : undefined}
                    isSelected={instanceInCell?.id === selectedInstanceId}
                    rowSpan={rowSpan}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DroppableCellProps {
  thu: number;
  tiet: number;
  instance?: ClassInstance;
  isSelected: boolean;
  rowSpan: number;
}

function DroppableCell({
  thu,
  tiet,
  instance,
  isSelected,
  rowSpan,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${thu}-${tiet}`,
    data: { thu, tiet },
  });

  const isComplete = instance
    ? !!(
        instance.tietBatDau &&
        instance.tietKetThuc &&
        instance.phongHocId && // ✅ Đổi từ phongHoc → phongHocId
        instance.ngayBatDau &&
        instance.ngayKetThuc
      )
    : false;

  return (
    <td
      ref={setNodeRef}
      rowSpan={rowSpan}
      className={`tkb-grid-cell ${isOver ? "hover" : ""}`}
    >
      {instance && (
        <TKBClassCard
          instance={instance}
          isSelected={isSelected}
          isComplete={isComplete}
        />
      )}
    </td>
  );
}
