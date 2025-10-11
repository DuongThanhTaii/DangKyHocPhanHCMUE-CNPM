import DuyetHocPhan from "../../features/duyet-hoc-phan/DuyetHocPhan";
import { useDeXuatHocPhan } from "../../features/tk/hooks";

export default function TkDuyetHocPhanPage() {
  const { data, loading, error, duyetDeXuat, tuChoiDeXuat } =
    useDeXuatHocPhan();

  return (
    <DuyetHocPhan
      data={data}
      loading={loading}
      error={error}
      actions={{
        duyetDeXuat,
        tuChoiDeXuat,
      }}
    />
  );
}
