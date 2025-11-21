interface Props {
  selectedKhoa: string;
  onChange: (khoaId: string) => void;
  disabled?: boolean;
}

export default function KhoaFilter({
  selectedKhoa,
  onChange,
  disabled,
}: Props) {
  // TODO: Fetch danh sách khoa từ API
  const danhSachKhoa = [
    { id: "all", tenKhoa: "Tất cả" },
    { id: "cntt", tenKhoa: "Công nghệ thông tin" },
    { id: "kt", tenKhoa: "Kinh tế" },
    { id: "nn", tenKhoa: "Ngoại ngữ" },
  ];

  return (
    <div className="form__field">
      <label className="form__label">Khoa</label>
      <select
        className="form__select"
        value={selectedKhoa}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {danhSachKhoa.map((khoa) => (
          <option key={khoa.id} value={khoa.id}>
            {khoa.tenKhoa}
          </option>
        ))}
      </select>
    </div>
  );
}
