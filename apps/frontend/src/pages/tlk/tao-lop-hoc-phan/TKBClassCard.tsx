import type { ClassInstance } from "./TaoThoiKhoaBieuModal";

interface Props {
  instance: ClassInstance;
  isSelected: boolean;
  isComplete: boolean;
  isForSinhVien?: boolean;
}

export default function TKBClassCard({
  instance,
  isSelected,
  isComplete,
  isForSinhVien = false,
}: Props) {
  // ✅ Debug
  console.log("Instance in card:", {
    id: instance.id,
    phongHocId: instance.phongHocId,
    tenPhongHoc: instance.tenPhongHoc,
  });

  const hasAnyInfo =
    instance.tietBatDau ||
    instance.tietKetThuc ||
    instance.phongHocId ||
    instance.ngayBatDau ||
    instance.ngayKetThuc;

  return (
    <div
      className={`class-item ${isSelected ? "selected" : ""} ${
        !isComplete ? "incomplete" : ""
      } ${!hasAnyInfo ? "no-info" : ""}`}
    >
      {!hasAnyInfo ? (
        <p style={{ margin: 0 }}>⏳ Chờ thiết lập...</p>
      ) : (
        <>
          {!isComplete && (
            <span className="class-item__badge-incomplete">
              Chưa hoàn thiện
            </span>
          )}

          <strong>
            <p>{instance.tenMon}</p>
            <p>({instance.maLopHP})</p>
          </strong>

          {instance.tietBatDau && instance.tietKetThuc && (
            <p>
              Tiết: {instance.tietBatDau}-{instance.tietKetThuc}
            </p>
          )}
          {isForSinhVien && <p>Giảng viên: {instance.tenGiangVien}</p>}
          {instance.tenPhongHoc && <p>Phòng: {instance.tenPhongHoc}</p>}
        </>
      )}
    </div>
  );
}
