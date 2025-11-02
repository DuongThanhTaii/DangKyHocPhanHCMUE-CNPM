import { useEffect, useMemo, useState } from "react";
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
  const { data: hocKyHienHanh, loading: loadingHocKyHienHanh } =
    useHocKyHienHanh();
  const { data: hocKyNienKhoas, loading: loadingHocKy } = useHocKyNienKhoa();

  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedHocKyId, setSelectedHocKyId] = useState<string>("");

  // ✅ Flatten data
  const nienKhoas = useMemo(
    () => Array.from(new Set(hocKyNienKhoas.map((nk) => nk.tenNienKhoa))),
    [hocKyNienKhoas]
  );

  const flatHocKys = useMemo(() => {
    const result: (HocKyItemDTO & { tenNienKhoa: string })[] = [];

    hocKyNienKhoas.forEach((nienKhoa) => {
      nienKhoa.hocKy.forEach((hk) => {
        result.push({
          ...hk,
          tenNienKhoa: nienKhoa.tenNienKhoa,
        });
      });
    });

    return result;
  }, [hocKyNienKhoas]);

  // ✅ Auto-select học kỳ hiện hành ONLY on mount (once)
  useEffect(() => {
    if (!autoSelectCurrent) return;

    // Only run if both data loaded AND no selection made yet
    if (
      loadingHocKyHienHanh ||
      loadingHocKy ||
      !hocKyHienHanh ||
      flatHocKys.length === 0
    ) {
      return;
    }

    // ✅ Only auto-select if BOTH fields are empty (first load)
    if (selectedHocKyId || selectedNienKhoa) {
      return;
    }

    const hkHienHanh = flatHocKys.find((hk) => hk.id === hocKyHienHanh.id);

    if (hkHienHanh) {
      setSelectedNienKhoa(hkHienHanh.tenNienKhoa);
      setSelectedHocKyId(hkHienHanh.id);
      onHocKyChange(hkHienHanh.id);
    }
  }, [
    hocKyHienHanh,
    flatHocKys,
    loadingHocKyHienHanh,
    loadingHocKy,
    selectedNienKhoa,
    autoSelectCurrent,
  ]);

  // ✅ Reset học kỳ khi đổi niên khóa
  useEffect(() => {
    setSelectedHocKyId("");
    onHocKyChange("");
  }, [selectedNienKhoa]);

  // ✅ Handle học kỳ change
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
          {nienKhoas.map((nk) => (
            <option key={nk} value={nk}>
              {nk}
            </option>
          ))}
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
          {flatHocKys
            .filter((hk) => hk.tenNienKhoa === selectedNienKhoa)
            .map((hk) => (
              <option key={hk.id} value={hk.id}>
                {hk.tenHocKy}
              </option>
            ))}
        </select>
      </div>
    </>
  );
}
