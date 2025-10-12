import DuyetHocPhan from "../../features/duyet-hoc-phan/DuyetHocPhan";
import { useDeXuatHocPhanTLK } from "../../features/tlk/hooks";

export default function TlkDuyetHocPhanPage() {
  const { data, loading, error } = useDeXuatHocPhanTLK();

  return (
    <DuyetHocPhan data={data} loading={loading} error={error} actions={{}} />
  );
}
