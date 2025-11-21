import type { HocPhanForCreateLopDTO } from "../../../features/tlk/types";

type SelectedConfig = {
  soLuongLop: string;
  tietBatDau: string;
  tietKetThuc: string;
  soTietMoiBuoi: string;
  tongSoTiet: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayHoc: string[];
  phongHoc: string;
};

type DanhSachHocPhanTaoLopProps = {
  data: HocPhanForCreateLopDTO[];
  selected: Record<string, SelectedConfig>;
  onCheck: (id: string) => void;
  onChange: (id: string, field: keyof SelectedConfig, value: any) => void;
};

export default function DanhSachHocPhanTaoLop({
  data,
  selected,
  onCheck,
  onChange,
}: DanhSachHocPhanTaoLopProps) {
  if (data.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "2rem" }}>
        Không có học phần nào để tạo lớp.
      </p>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Mã HP</th>
          <th>Tên HP</th>
          <th>STC</th>
          <th>Số sinh viên ghi danh</th>
          <th>Giảng viên</th>
        </tr>
      </thead>
      <tbody>
        {data.map((hp) => {
          const sel = selected[hp.id];
          const disabled = !sel;

          return (
            <tr key={hp.id}>
              <td>{hp.maHocPhan}</td>
              <td>{hp.tenHocPhan}</td>
              <td>{hp.soTinChi}</td>
              <td>{hp.soSinhVienGhiDanh}</td>
              <td>{hp.tenGiangVien}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
