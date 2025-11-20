import { useEffect, useMemo, useState, useRef } from "react";
import { useHocKyHienHanh, useHocKyNienKhoa } from "../features/common/hooks";
import type { HocKyItemDTO } from "../features/common/types";

interface HocKySelectorProps {
  onHocKyChange: (hocKyId: string) => void;
  disabled?: boolean;
  autoSelectCurrent?: boolean; // ✅ Option to auto-select học kỳ hiện hành
}

export default function HocKySelector({
  onHocKyChange,
  disabled = false,
  autoSelectCurrent = true,
}: HocKySelectorProps) {
  const { data: hocKyHienHanh, loading: loadingHienHanh } = useHocKyHienHanh();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();

  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  // ✅ FIX: Track if we've already auto-selected to prevent infinite loop
  const hasAutoSelected = useRef(false);

  const flatHocKys = useMemo(() => {
    const result: (HocKyItemDTO & { tenNienKhoa: string })[] = [];
    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({ ...hk, tenNienKhoa: nienKhoa.tenNienKhoa });
      });
    });
    return result;
  }, [hocKyNienKhoas]);

  // ✅ Auto-select học kỳ hiện hành ONLY ONCE
  useEffect(() => {
    // ✅ Guard: Skip if already auto-selected
    if (hasAutoSelected.current) return;

    // ✅ Guard: Skip if not ready
    if (
      loadingHienHanh ||
      loadingHocKy ||
      !hocKyHienHanh ||
      flatHocKys.length === 0
    ) {
      return;
    }

    // ✅ Guard: Skip if autoSelectCurrent is false
    if (!autoSelectCurrent) {
      hasAutoSelected.current = true; // Mark as checked
      return;
    }

    const hkHienHanh = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

    if (hkHienHanh) {
      console.log("✅ [HocKySelector] Auto-selecting:", hkHienHanh.tenHocKy);
      setSelectedNienKhoa(hkHienHanh.tenNienKhoa);
      setSelectedHocKyId(hkHienHanh.id);
      onHocKyChange(hkHienHanh.id);
      hasAutoSelected.current = true; // ✅ Mark as done
    }
  }, [
    hocKyHienHanh,
    flatHocKys,
    loadingHienHanh,
    loadingHocKy,
    autoSelectCurrent,
  ]); // ✅ Remove onHocKyChange

  // ✅ Reset học kỳ khi đổi niên khóa
  useEffect(() => {
    setSelectedHocKyId("");
  }, [selectedNienKhoa]);

  const filteredHocKys = useMemo(
    () =>
      selectedNienKhoa
        ? flatHocKys.filter((hk) => hk.tenNienKhoa === selectedNienKhoa)
        : [],
    [flatHocKys, selectedNienKhoa]
  );

  // ✅ Manual selection handler
  const handleHocKyChange = (hocKyId: string) => {
    setSelectedHocKyId(hocKyId);
    onHocKyChange(hocKyId);
  };

  return (
    <>
      {/* Niên khóa */}
      <div className="mr_20">
        <select
          className="form__select w__200"
          value={selectedNienKhoa}
          onChange={(e) => setSelectedNienKhoa(e.target.value)}
          disabled={disabled || loadingHocKy}
        >
          <option value="">-- Chọn Niên khóa --</option>
          {Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))).map(
            (tenNK) => (
              <option key={tenNK} value={tenNK}>
                {tenNK}
              </option>
            )
          )}
        </select>
      </div>

      {/* Học kỳ */}
      <div className="mr_20">
        <select
          className="form__select w__200"
          value={selectedHocKyId}
          onChange={(e) => handleHocKyChange(e.target.value)}
          disabled={disabled || !selectedNienKhoa || loadingHocKy}
        >
          <option value="">-- Chọn Học kỳ --</option>
          {filteredHocKys.map((hk) => (
            <option key={hk.id} value={hk.id}>
              {hk.tenHocKy}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
