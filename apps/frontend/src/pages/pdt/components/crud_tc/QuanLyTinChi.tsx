import React, { useEffect, useMemo, useState } from "react";
import "../../../../styles/reset.css";
import "../../../../styles/menu.css";
import { useModalContext } from "../../../../hook/ModalContext";

type ChinhSachTinChi = {
  id: string;
  hoc_ky?: { ten_hoc_ky?: string | null; ma_hoc_ky?: string | null } | null;
  khoa?: { ten_khoa?: string | null } | null;
  nganh_hoc?: { ten_nganh?: string | null } | null;
  phi_moi_tin_chi: number;
  ngay_hieu_luc?: string | null;
  ngay_het_hieu_luc?: string | null;
};

type Khoa = { id: string; ten_khoa: string };
type Nganh = { id: string; ten_nganh: string; khoa_id: string };

// Chuẩn hoá kiểu dữ liệu Niên khóa – Học kỳ dùng cho FE
type HocKy = { id: string; ten_hoc_ky: string; ma_hoc_ky?: string };
type NienKhoa = { id: string; ten_nien_khoa: string; hoc_kys: HocKy[] };

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Guard parse JSON để không vấp lỗi "<!DOCTYPE..."
const safeJson = async (res: Response) => {
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${res.statusText} ${txt?.slice(0, 100) ?? ""}`
    );
  }
  if (!ct.includes("application/json")) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Invalid JSON: ${txt?.slice(0, 100) ?? ""}`);
  }
  return res.json();
};

const formatCurrency = (v: number) =>
  (isFinite(v) ? v : 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

/** Chuẩn hoá nhiều dạng payload của /api/pdt/hoc-ky-nien-khoa về dạng NienKhoa[] */
function normalizeNienKhoa(raw: any): NienKhoa[] {
  const data = raw?.data ?? raw ?? [];

  // CASE A: Đã là dạng {id, ten_nien_khoa, hoc_kys:[{id,ten_hoc_ky,ma_hoc_ky}]}
  if (Array.isArray(data) && data.length && Array.isArray(data[0]?.hoc_kys)) {
    return data.map((nk: any) => ({
      id: nk.id,
      ten_nien_khoa: nk.ten_nien_khoa ?? nk.ten ?? "",
      hoc_kys: (nk.hoc_kys || []).map((hk: any) => ({
        id: hk.id,
        ten_hoc_ky: hk.ten_hoc_ky ?? `${hk.ma_hoc_ky ?? ""}`.trim(),
        ma_hoc_ky: hk.ma_hoc_ky,
      })),
    }));
  }

  // CASE B: Trả flat list học kỳ, có trường id_nien_khoa + ten_nien_khoa
  if (
    Array.isArray(data) &&
    data.length &&
    (data[0]?.id_nien_khoa || data[0]?.nien_khoa_id)
  ) {
    const m = new Map<string, NienKhoa>();
    for (const hk of data) {
      const nkId = hk.id_nien_khoa ?? hk.nien_khoa_id;
      const nkName = hk.ten_nien_khoa ?? hk.nien_khoa?.ten_nien_khoa ?? "";
      if (!m.has(nkId))
        m.set(nkId, { id: nkId, ten_nien_khoa: nkName, hoc_kys: [] });
      m.get(nkId)!.hoc_kys.push({
        id: hk.id,
        ten_hoc_ky: hk.ten_hoc_ky ?? `${hk.ma_hoc_ky ?? ""}`.trim(),
        ma_hoc_ky: hk.ma_hoc_ky,
      });
    }
    return Array.from(m.values());
  }

  // CASE C: Trả flat, không có nien_khoa => gom tất cả dưới 1 nhãn tổng
  if (Array.isArray(data)) {
    return [
      {
        id: "all",
        ten_nien_khoa: "Tất cả niên khóa",
        hoc_kys: data.map((hk: any) => ({
          id: hk.id,
          ten_hoc_ky: hk.ten_hoc_ky ?? `${hk.ma_hoc_ky ?? ""}`.trim(),
          ma_hoc_ky: hk.ma_hoc_ky,
        })),
      },
    ];
  }

  return [];
}

export default function QuanLyTinChi() {
  const { openNotify, openConfirm } = useModalContext();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ChinhSachTinChi[]>([]);
  const [khoas, setKhoas] = useState<Khoa[]>([]);
  const [nganhs, setNganhs] = useState<Nganh[]>([]);
  const [nienKhoas, setNienKhoas] = useState<NienKhoa[]>([]);
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<string>("");
  const [selectedKhoa, setSelectedKhoa] = useState("");

  const hocKysBySelectedNK: HocKy[] = useMemo(() => {
    const nk = nienKhoas.find((x) => x.id === selectedNienKhoa);
    return nk?.hoc_kys ?? [];
  }, [nienKhoas, selectedNienKhoa]);

  const filteredNganh = useMemo(
    () =>
      selectedKhoa ? nganhs.filter((n) => n.khoa_id === selectedKhoa) : nganhs,
    [selectedKhoa, nganhs]
  );

  const [form, setForm] = useState({
    hoc_ky_id: "",
    khoa_id: "",
    nganh_id: "",
    phi_moi_tin_chi: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [csRes, khoaRes, nganhRes, hkRes] = await Promise.all([
        fetch(`${API}/chinh-sach-tin-chi`),
        fetch(`${API}/dm/khoa`),
        fetch(`${API}/dm/nganh`),
        fetch(`${API}/pdt/hoc-ky-nien-khoa`),
      ]);

      const [cs, khoasJSON, nganhsJSON, hkJSON] = await Promise.all([
        safeJson(csRes),
        safeJson(khoaRes),
        safeJson(nganhRes),
        safeJson(hkRes),
      ]);

      if (cs?.isSuccess) setList(cs.data || []);
      if (khoasJSON?.isSuccess) setKhoas(khoasJSON.data || []);
      if (nganhsJSON?.isSuccess) setNganhs(nganhsJSON.data || []);

      setNienKhoas(normalizeNienKhoa(hkJSON));
    } catch (e: any) {
      console.error(e);
      openNotify(`Lỗi tải dữ liệu: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Khi đổi khoa → tải lại ngành theo khoa (nếu backend có filter)
  useEffect(() => {
    const fetchNganhByKhoa = async () => {
      try {
        const res = await fetch(
          `${API}/dm/nganh${selectedKhoa ? `?khoa_id=${selectedKhoa}` : ""}`
        );
        const json = await safeJson(res);
        if (json?.isSuccess) {
          setNganhs(json.data || []);
        }
      } catch (e: any) {
        console.error(e);
        openNotify(`Lỗi tải ngành theo khoa: ${e.message}`, "error");
      }
    };
    fetchNganhByKhoa();
  }, [selectedKhoa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.hoc_ky_id) {
      openNotify("Vui lòng chọn 'Niên khóa' và 'Học kỳ áp dụng'", "warning");
      return;
    }
    if (!form.phi_moi_tin_chi) {
      openNotify("Vui lòng nhập 'Phí mỗi tín chỉ'", "warning");
      return;
    }

    const confirmed = await openConfirm({
      message: "Bạn chắc chắn muốn lưu chính sách này?",
      confirmText: "Lưu",
      cancelText: "Hủy",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/chinh-sach-tin-chi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoc_ky_id: form.hoc_ky_id,
          khoa_id: form.khoa_id || null,
          nganh_id: form.nganh_id || null,
          phi_moi_tin_chi: Number(form.phi_moi_tin_chi),
        }),
      });
      const json = await safeJson(res);
      if (json?.isSuccess) {
        openNotify("Lưu chính sách thành công!", "success");
        setForm({
          hoc_ky_id: "",
          khoa_id: "",
          nganh_id: "",
          phi_moi_tin_chi: "",
        });
        setSelectedNienKhoa("");
        setSelectedKhoa("");
        fetchAll();
      } else {
        openNotify(json?.message || "Không thể lưu chính sách", "error");
      }
    } catch (e: any) {
      console.error(e);
      openNotify(`Lỗi khi lưu: ${e.message}`, "error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Quản lý chính sách tín chỉ</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="df"
        style={{
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {/* Niên khóa */}
        <select
          value={selectedNienKhoa}
          onChange={(e) => {
            const nkId = e.target.value;
            setSelectedNienKhoa(nkId);
            // reset học kỳ khi đổi NK
            setForm((f) => ({ ...f, hoc_ky_id: "" }));
          }}
        >
          <option value="">-- Chọn niên khóa --</option>
          {nienKhoas.map((nk) => (
            <option key={nk.id} value={nk.id}>
              {nk.ten_nien_khoa}
            </option>
          ))}
        </select>

        {/* Học kỳ theo niên khóa */}
        <select
          value={form.hoc_ky_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, hoc_ky_id: e.target.value }))
          }
          disabled={!selectedNienKhoa}
        >
          <option value="">-- Học kỳ áp dụng --</option>
          {hocKysBySelectedNK.map((hk) => (
            <option key={hk.id} value={hk.id}>
              {hk.ten_hoc_ky}
            </option>
          ))}
        </select>

        {/* Khoa */}
        <select
          value={form.khoa_id}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedKhoa(val);
            setForm((f) => ({ ...f, khoa_id: val, nganh_id: "" }));
          }}
        >
          <option value="">-- Áp dụng cho khoa (tùy chọn) --</option>
          {khoas.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ten_khoa}
            </option>
          ))}
        </select>

        {/* Ngành */}
        <select
          value={form.nganh_id}
          onChange={(e) => setForm((f) => ({ ...f, nganh_id: e.target.value }))}
          disabled={!form.khoa_id}
        >
          <option value="">-- Áp dụng cho ngành (tùy chọn) --</option>
          {filteredNganh.map((n) => (
            <option key={n.id} value={n.id}>
              {n.ten_nganh}
            </option>
          ))}
        </select>

        {/* Đơn giá */}
        <input
          type="number"
          min={0}
          step={1000}
          name="phi_moi_tin_chi"
          placeholder="Phí mỗi tín chỉ (VND)"
          value={form.phi_moi_tin_chi}
          onChange={(e) =>
            setForm((f) => ({ ...f, phi_moi_tin_chi: e.target.value }))
          }
        />

        <button type="submit" className="btn__primary">
          Lưu chính sách
        </button>
      </form>

      {/* BẢNG DANH SÁCH */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="table__ql">
          <thead>
            <tr>
              <th>STT</th>
              <th>Học kỳ</th>
              <th>Khoa</th>
              <th>Ngành</th>
              <th>Phí / tín chỉ</th>
              <th>Hiệu lực</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6}>Chưa có chính sách</td>
              </tr>
            ) : (
              list.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td>{d.hoc_ky?.ten_hoc_ky || "-"}</td>
                  <td>{d.khoa?.ten_khoa || "-"}</td>
                  <td>{d.nganh_hoc?.ten_nganh || "-"}</td>
                  <td>{formatCurrency(d.phi_moi_tin_chi)}</td>
                  <td>
                    {d.ngay_hieu_luc
                      ? new Date(d.ngay_hieu_luc).toLocaleDateString("vi-VN")
                      : "-"}
                    {" → "}
                    {d.ngay_het_hieu_luc
                      ? new Date(d.ngay_het_hieu_luc).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
