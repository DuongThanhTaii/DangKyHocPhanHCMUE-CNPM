import DuyetHocPhan from "../../features/duyet-hoc-phan/DuyetHocPhan";
import { useDeXuatHocPhanPDT } from "../../features/pdt/hooks";

export default function PdtDuyetHocPhanPage() {
  const { data, loading, error, duyetDeXuat, tuChoiDeXuat } =
    useDeXuatHocPhanPDT();

  return (
    <DuyetHocPhan
      data={data}
      loading={loading}
      error={error}
      actions={{
        duyetDeXuat,
        tuChoiDeXuat, // ✅ Inject action từ chối
      }}
    />
  );
}
