import { forwardRef } from "react";
import {
  PhaseConfigBase,
  type PhaseConfigRef,
  type ExistingDotConfig,
} from "./PhaseConfigBase";
import type {
  KhoaDTO,
  DotGhiDanhResponseDTO,
} from "../../../features/pdt/types/pdtTypes";

interface Props {
  danhSachKhoa: KhoaDTO[];
  phaseStartTime: string;
  phaseEndTime: string;
  existingData?: DotGhiDanhResponseDTO[];
  hocKyId: string; // ✅ Add hocKyId
  onSubmit: (data: any) => Promise<void>; // ✅ Add submit callback
}

export const GhiDanhConfig = forwardRef<PhaseConfigRef, Props>(
  (
    {
      danhSachKhoa,
      phaseStartTime,
      phaseEndTime,
      existingData = [],
      hocKyId,
      onSubmit,
    },
    ref
  ) => {
    // ✅ Map DotGhiDanhResponseDTO → ExistingDotConfig
    const mappedData: ExistingDotConfig[] = existingData.map((dot) => ({
      id: dot.id,
      khoaId: dot.khoaId,
      tenKhoa: dot.tenKhoa,
      thoiGianBatDau: dot.thoiGianBatDau,
      thoiGianKetThuc: dot.thoiGianKetThuc,
      isCheckToanTruong: dot.isCheckToanTruong,
    }));

    // ✅ Handle submit for Ghi Danh
    const handleSubmit = async (
      data: { isToanTruong: boolean; dotTheoKhoa: any[] }
    ) => {
      const toanTruongDot = existingData.find((dot) => dot.isCheckToanTruong);

      const payload = {
        hocKyId,
        isToanTruong: data.isToanTruong,
        thoiGianBatDau: data.isToanTruong
          ? new Date(phaseStartTime).toISOString()
          : undefined,
        thoiGianKetThuc: data.isToanTruong
          ? new Date(phaseEndTime).toISOString()
          : undefined,
        dotToanTruongId: data.isToanTruong ? toanTruongDot?.id : undefined,
        dotTheoKhoa: data.isToanTruong
          ? undefined
          : data.dotTheoKhoa.map((dot) => {
              const existingDot = existingData.find(
                (existing) => existing.khoaId === dot.khoaId
              );
              return {
                id: existingDot?.id,
                khoaId: dot.khoaId,
                thoiGianBatDau: new Date(dot.thoiGianBatDau).toISOString(),
                thoiGianKetThuc: new Date(dot.thoiGianKetThuc).toISOString(),
              };
            }),
      };

      await onSubmit(payload);
    };

    return (
      <PhaseConfigBase
        ref={ref}
        title="Thiết lập đợt ghi danh"
        danhSachKhoa={danhSachKhoa}
        phaseStartTime={phaseStartTime}
        phaseEndTime={phaseEndTime}
        existingData={mappedData}
        onSubmit={handleSubmit}
      />
    );
  }
);

GhiDanhConfig.displayName = "GhiDanhConfig";
