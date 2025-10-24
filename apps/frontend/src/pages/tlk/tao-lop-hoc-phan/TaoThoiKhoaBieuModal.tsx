import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import TKBSidebar from "./TKBSidebar";
import TKBGrid from "./TKBGrid";
import "./tao-tkb-modal.css";
import type { HocPhanForCreateLopDTO } from "../../../features/tlk/types";
import { useModalContext } from "../../../hook/ModalContext";
import { useXepThoiKhoaBieu } from "../../../features/tlk/hooks";
import { tlkAPI } from "../../../features/tlk/api/tlkAPI";
import type { ThoiKhoaBieuMonHocDTO } from "../../../features/tlk/types";

export interface TietHoc {
  tiet: number;
  gioVao: string;
  gioRa: string;
  label: string;
}

export interface ClassInstance {
  id: string;
  maLopHP: string;
  tenMon: string;
  tenLop?: string; // ✅ Tên lớp từ BE (COMP1010_1)
  lopHocPhanId: string;
  position?: { thu: number; tiet: number };
  tietBatDau?: number;
  tietKetThuc?: number;
  phongHocId?: string; // ✅ ID phòng (UUID)
  tenPhongHoc?: string; // ✅ Tên phòng để hiển thị
  ngayBatDau?: string;
  ngayKetThuc?: string;
  isFromBackend?: boolean; // ✅ Flag để phân biệt TKB cũ/mới
  isReadonly?: boolean; // ✅ Không cho sửa/xóa
}

interface Props {
  danhSachLop: HocPhanForCreateLopDTO[];
  hocKyId: string;
  onClose: () => void;
  onSuccess?: () => void;
  giangVienId?: string; // ✅ Nhận giảng viên ID từ parent
}

export default function TaoThoiKhoaBieuModal({
  onClose,
  danhSachLop,
  hocKyId,
  onSuccess,
  giangVienId, // ✅ Destructure giangVienId
}: Props) {
  const { openNotify } = useModalContext();
  const { xepTKB, submitting } = useXepThoiKhoaBieu();

  const [instances, setInstances] = useState<ClassInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLopId, setSelectedLopId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const TIET_HOC_CONFIG: TietHoc[] = [
    { tiet: 1, gioVao: "06:30", gioRa: "07:20", label: "6h30-7h20" },
    { tiet: 2, gioVao: "07:20", gioRa: "08:10", label: "7h20-8h10" },
    { tiet: 3, gioVao: "08:10", gioRa: "09:00", label: "8h10-9h00" },
    { tiet: 4, gioVao: "09:10", gioRa: "10:00", label: "9h10-10h00" },
    { tiet: 5, gioVao: "10:00", gioRa: "10:50", label: "10h00-10h50" },
    { tiet: 6, gioVao: "10:50", gioRa: "11:40", label: "10h50-11h40" },
    { tiet: 7, gioVao: "12:30", gioRa: "13:20", label: "12h30-13h20" },
    { tiet: 8, gioVao: "13:20", gioRa: "14:10", label: "13h20-14h10" },
    { tiet: 9, gioVao: "14:10", gioRa: "15:00", label: "14h10-15h00" },
    { tiet: 10, gioVao: "15:10", gioRa: "16:00", label: "15h10-16h00" },
    { tiet: 11, gioVao: "16:00", gioRa: "16:50", label: "16h00-16h50" },
    { tiet: 12, gioVao: "16:50", gioRa: "17:40", label: "16h50-17h40" },
  ];

  // ✅ Fetch TKB đã có khi mở modal
  useEffect(() => {
    const fetchExistingTKB = async () => {
      setLoading(true);
      try {
        const maHocPhans = danhSachLop.map((lop) => lop.maHocPhan);
        console.log("🔍 [TKB] Fetching TKB for:", maHocPhans);

        const result = await tlkAPI.getTKBByMaHocPhans(maHocPhans, hocKyId);

        console.log("🔍 [TKB] API Response:", result);

        if (result.isSuccess && result.data) {
          const existingInstances = convertTKBToInstances(
            result.data,
            danhSachLop
          );

          console.log("🔍 [TKB] Converted instances:", existingInstances);
          console.log(
            "🔍 [TKB] Instance flags:",
            existingInstances.map((i) => ({
              id: i.id,
              isFromBackend: i.isFromBackend,
              isReadonly: i.isReadonly,
              hasAllData: !!(
                i.position &&
                i.tietBatDau &&
                i.tietKetThuc &&
                i.phongHocId &&
                i.ngayBatDau &&
                i.ngayKetThuc
              ),
            }))
          );

          setInstances(existingInstances);
        }
      } catch (error) {
        console.error("❌ [TKB] Error fetching TKB:", error);
        openNotify({
          message: "Lỗi tải thời khóa biểu",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExistingTKB();
  }, [hocKyId, danhSachLop, openNotify]);

  // ✅ Convert BE data → ClassInstance
  const convertTKBToInstances = (
    tkbData: ThoiKhoaBieuMonHocDTO[],
    danhSachLop: HocPhanForCreateLopDTO[]
  ): ClassInstance[] => {
    const instances: ClassInstance[] = [];

    console.log("🔍 [Convert] Input TKB data:", tkbData);
    console.log("🔍 [Convert] Input danhSachLop:", danhSachLop);

    tkbData.forEach((tkb) => {
      const lopData = danhSachLop.find(
        (lop) => lop.maHocPhan === tkb.maHocPhan
      );

      console.log(`🔍 [Convert] Processing ${tkb.maHocPhan}:`, {
        tkb,
        lopData,
      });

      if (!lopData) {
        console.warn(
          `⚠️ [Convert] Không tìm thấy lopData cho ${tkb.maHocPhan}`
        );
        return;
      }

      tkb.danhSachLop.forEach((lop, index) => {
        console.log(`🔍 [Convert] Processing lop ${index}:`, lop);

        const instance: ClassInstance = {
          id: lop.id || `existing-${Date.now()}-${Math.random()}`,
          maLopHP: tkb.maHocPhan,
          tenMon: lopData.tenHocPhan,
          tenLop: lop.tenLop,
          lopHocPhanId: lopData.id,

          // ✅ Map position từ thuTrongTuan và tietBatDau
          position: lop.thuTrongTuan
            ? { thu: lop.thuTrongTuan, tiet: lop.tietBatDau }
            : undefined,

          // ✅ Map đầy đủ thông tin tiết học
          tietBatDau: lop.tietBatDau,
          tietKetThuc: lop.tietKetThuc,

          // ✅ Map cả phongHocId và tenPhongHoc
          phongHocId: lop.phongHocId,
          tenPhongHoc: lop.phongHoc,

          // ✅ Map ngày bắt đầu/kết thúc
          ngayBatDau: new Date(lop.ngayBatDau).toISOString().split("T")[0],
          ngayKetThuc: new Date(lop.ngayKetThuc).toISOString().split("T")[0],

          // ✅ Đánh dấu từ BE
          isFromBackend: true,
          isReadonly: true,
        };

        console.log(`✅ [Convert] Created instance:`, instance);
        instances.push(instance);
      });
    });

    console.log("🔍 [Convert] Final instances:", instances);
    return instances;
  };

  const filteredInstances = selectedLopId
    ? instances.filter((inst) => inst.lopHocPhanId === selectedLopId)
    : [];

  const handleDragStart = (event: DragStartEvent) => {
    const instance = instances.find((i) => i.id === event.active.id);
    // ✅ Không cho drag TKB cũ
    if (instance?.isReadonly) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const instance = instances.find((i) => i.id === active.id);
    // ✅ Không cho drop TKB cũ
    if (instance?.isReadonly) {
      setActiveId(null);
      return;
    }

    const instanceId = active.id as string;
    const dropData = over.data.current as
      | { thu: number; tiet: number }
      | undefined;

    if (dropData) {
      // ✅ Kiểm tra conflict với TKB cũ
      const hasConflict = instances.some(
        (inst) =>
          inst.isReadonly &&
          inst.position?.thu === dropData.thu &&
          inst.position?.tiet === dropData.tiet
      );

      if (hasConflict) {
        openNotify({
          message: "Ô này đã có lớp học cũ, không thể xếp!",
          type: "error",
        });
        setActiveId(null);
        return;
      }

      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId
            ? {
                ...inst,
                position: { thu: dropData.thu, tiet: dropData.tiet },
              }
            : inst
        )
      );
    }

    setActiveId(null);
  };

  const handleAddInstance = (lopData: HocPhanForCreateLopDTO) => {
    const newInstance: ClassInstance = {
      id: `new-${Date.now()}-${Math.random()}`,
      maLopHP: lopData.maHocPhan,
      tenMon: lopData.tenHocPhan,
      lopHocPhanId: lopData.id,
      isFromBackend: false, // ✅ Buổi học mới
      isReadonly: false,
    };

    setInstances((prev) => [...prev, newInstance]);
    setSelectedInstanceId(newInstance.id);
  };

  const handleUpdateInstance = (
    id: string,
    updates: Partial<ClassInstance>
  ) => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === id && !inst.isReadonly) {
          const updated = { ...inst, ...updates };

          if (
            updates.tietBatDau &&
            updated.tietKetThuc &&
            updated.tietKetThuc < updates.tietBatDau
          ) {
            updated.tietKetThuc = undefined;
          }

          return updated;
        }
        return inst;
      })
    );
  };

  const handleDeleteInstance = (id: string) => {
    const instance = instances.find((i) => i.id === id);
    if (instance?.isReadonly) {
      openNotify({
        message: "Không thể xóa lớp học đã có sẵn!",
        type: "error",
      });
      return;
    }

    setInstances((prev) => prev.filter((inst) => inst.id !== id));
    if (selectedInstanceId === id) {
      setSelectedInstanceId(null);
    }
  };

  // ✅ Hàm validate và lưu TKB
  const handleSave = async () => {
    console.log("🔍 [Save] All instances:", instances);
    console.log("🔍 [Save] giangVienId from props:", giangVienId); // ✅ Debug

    const newInstances = instances.filter((inst) => !inst.isFromBackend);

    console.log("🔍 [Save] New instances only:", newInstances);

    const incompleteInstances = newInstances.filter(
      (inst) =>
        !inst.position ||
        !inst.tietBatDau ||
        !inst.tietKetThuc ||
        !inst.phongHocId ||
        !inst.ngayBatDau ||
        !inst.ngayKetThuc
    );

    if (incompleteInstances.length > 0) {
      openNotify({
        message: `Còn ${incompleteInstances.length} buổi học mới chưa hoàn thiện!`,
        type: "error",
      });
      return;
    }

    if (newInstances.length === 0) {
      openNotify({
        message: "Không có buổi học mới nào để lưu!",
        type: "warning",
      });
      return;
    }

    // ✅ Group instances theo maHocPhan VÀ giangVienId
    const groupedByMaHP = newInstances.reduce((acc, inst) => {
      // Tìm học phần tương ứng để lấy giangVienId
      const hocPhan = danhSachLop.find((hp) => hp.id === inst.lopHocPhanId);
      const key = `${inst.maLopHP}_${hocPhan?.giangVienId || "unknown"}`;

      if (!acc[key]) {
        acc[key] = {
          maHocPhan: inst.maLopHP,
          giangVienId: hocPhan?.giangVienId,
          instances: [],
        };
      }

      acc[key].instances.push(inst);
      return acc;
    }, {} as Record<string, { maHocPhan: string; giangVienId?: string; instances: ClassInstance[] }>);

    // ✅ Tạo request cho từng nhóm
    const requests = Object.values(groupedByMaHP).map((group) => {
      const baseRequest = {
        maHocPhan: group.maHocPhan,
        hocKyId,
        danhSachLop: group.instances.map((inst, index) => ({
          tenLop: `${inst.maLopHP}_${index + 1}`,
          phongHocId: inst.phongHocId!,
          ngayBatDau: new Date(inst.ngayBatDau!),
          ngayKetThuc: new Date(inst.ngayKetThuc!),
          tietBatDau: inst.tietBatDau!,
          tietKetThuc: inst.tietKetThuc!,
          thuTrongTuan: inst.position!.thu,
        })),
      };

      if (group.giangVienId) {
        return { ...baseRequest, giangVienId: group.giangVienId };
      }

      return baseRequest;
    });

    console.log("🔍 [Save] Final requests:", requests); // ✅ Debug

    // ✅ Call API cho từng học phần
    let successCount = 0;
    for (const req of requests) {
      console.log("🔍 [Save] Sending request:", req); // ✅ Debug
      const result = await xepTKB(req);
      if (result.success) {
        successCount++;
      }
    }

    if (successCount === requests.length) {
      openNotify({
        message: `Đã xếp ${successCount} học phần mới!`,
        type: "success",
      });
      onSuccess?.();
      onClose();
    } else {
      openNotify({
        message: `Chỉ xếp thành công ${successCount}/${requests.length} học phần`,
        type: "warning",
      });
    }
  };

  if (loading) {
    return (
      <div className="tkb-modal-overlay">
        <div className="tkb-modal-container">
          <div className="tkb-modal-loading">Đang tải thời khóa biểu...</div>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="tkb-modal-overlay" onClick={onClose}>
        <div
          className="tkb-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tkb-modal-header">
            <h2>Tạo Thời Khóa Biểu</h2>
            <button className="tkb-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="tkb-modal-body">
            <TKBSidebar
              danhSachLop={danhSachLop}
              instances={filteredInstances}
              selectedInstanceId={selectedInstanceId}
              selectedLopId={selectedLopId}
              tietHocConfig={TIET_HOC_CONFIG}
              onAddInstance={handleAddInstance}
              onSelectInstance={setSelectedInstanceId}
              onUpdateInstance={handleUpdateInstance}
              onDeleteInstance={handleDeleteInstance}
              onSelectLop={setSelectedLopId}
            />

            <TKBGrid
              instances={instances}
              tietHocConfig={TIET_HOC_CONFIG}
              selectedInstanceId={selectedInstanceId}
            />
          </div>

          <div className="tkb-modal-footer">
            <button
              className="btn__cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              className="btn__save"
              onClick={handleSave}
              disabled={submitting || instances.length === 0}
            >
              {submitting ? "Đang lưu..." : "Lưu Thời Khóa Biểu"}
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="tkb-drag-overlay">
            {instances.find((i) => i.id === activeId)?.tenMon || "Lớp học"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
