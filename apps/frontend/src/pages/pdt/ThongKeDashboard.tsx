import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { useModalContext } from "../../hook/ModalContext";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

/* ========= Types ========= */
type Khoa = { id: string; ten_khoa: string };
type Nganh = { id: string; ten_nganh: string; khoa_id: string };

type HocKy = { id: string; ten_hoc_ky: string; ma_hoc_ky?: string };
type NienKhoa = { id: string; ten_nien_khoa: string; hoc_kys: HocKy[] };

type OverviewPayload = {
  svUnique: number;
  soDK: number;
  soLHP: number;
  taiChinh: { thuc_thu: number; ky_vong: number };
  ketLuan: string;
};

type DKTheoKhoaRow = { ten_khoa: string; so_dang_ky: number };
type DKTheoNganhRow = { ten_nganh: string; so_dang_ky: number };
type TaiGiangVienRow = { ho_ten: string; so_lop: number };

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ========= Utils ========= */
const currency = (v: number) =>
  (isFinite(v) ? v : 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const safeJson = async (res: Response) => {
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${res.statusText} ${txt?.slice(0, 120) ?? ""}`
    );
  }
  if (!ct.includes("application/json")) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Invalid JSON: ${txt?.slice(0, 120) ?? ""}`);
  }
  return res.json();
};

/** Chuẩn hoá nhiều dạng payload /pdt/hoc-ky-nien-khoa về dạng NienKhoa[] */
function normalizeNienKhoa(raw: any): NienKhoa[] {
  const data = raw?.data ?? raw ?? [];
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

/** Lấy PNG DataURL từ phần tử SVG của Recharts để gửi vào PDF */
async function getChartPNGFromContainer(
  container: HTMLElement,
  width = 1200,
  height = 600
): Promise<string> {
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("Không tìm thấy SVG trong biểu đồ");

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";
  const dataUrl: string = await new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Không thể khởi tạo canvas"));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const out = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      resolve(out);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
  return dataUrl;
}

/* ========= Component ========= */
export default function BaoCaoThongKe() {
  const { openNotify } = useModalContext();

  // filters
  const [nienKhoas, setNienKhoas] = useState<NienKhoa[]>([]);
  const [khoas, setKhoas] = useState<Khoa[]>([]);
  const [nganhs, setNganhs] = useState<Nganh[]>([]);

  const [nkId, setNkId] = useState<string>("");
  const hocKysByNK: HocKy[] = useMemo(
    () => nienKhoas.find((x) => x.id === nkId)?.hoc_kys ?? [],
    [nienKhoas, nkId]
  );
  const [hocKyId, setHocKyId] = useState<string>("");
  const [khoaId, setKhoaId] = useState<string>("");
  const [nganhId, setNganhId] = useState<string>("");

  const filteredNganhs = useMemo(
    () => (khoaId ? nganhs.filter((n) => n.khoa_id === khoaId) : nganhs),
    [nganhs, khoaId]
  );

  // data blocks
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [dkTheoKhoa, setDkTheoKhoa] = useState<DKTheoKhoaRow[]>([]);
  const [ketLuanKhoa, setKetLuanKhoa] = useState<string>("");
  const [dkTheoNganh, setDkTheoNganh] = useState<DKTheoNganhRow[]>([]);
  const [ketLuanNganh, setKetLuanNganh] = useState<string>("");
  const [taiGV, setTaiGV] = useState<TaiGiangVienRow[]>([]);
  const [ketLuanGV, setKetLuanGV] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // chart refs (wrap container divs to convert to PNG later)
  const refKhoa = useRef<HTMLDivElement | null>(null);
  const refNganh = useRef<HTMLDivElement | null>(null);
  const refGV = useRef<HTMLDivElement | null>(null);
  const refFinance = useRef<HTMLDivElement | null>(null);

  const loadStatic = async () => {
    try {
      const [nkRes, kRes, nRes] = await Promise.all([
        fetch(`${API}/pdt/hoc-ky-nien-khoa`),
        fetch(`${API}/dm/khoa`),
        fetch(`${API}/dm/nganh`),
      ]);
      const [nkJSON, kJSON, nJSON] = await Promise.all([
        safeJson(nkRes),
        safeJson(kRes),
        safeJson(nRes),
      ]);
      setNienKhoas(normalizeNienKhoa(nkJSON));
      if (kJSON?.isSuccess) setKhoas(kJSON.data || []);
      if (nJSON?.isSuccess) setNganhs(nJSON.data || []);
    } catch (e: any) {
      console.error(e);
      openNotify(`Lỗi tải danh mục: ${e.message}`, "error");
    }
  };

  useEffect(() => {
    loadStatic();
  }, []);

  const loadReports = async () => {
    if (!hocKyId) {
      openNotify("Vui lòng chọn Niên khóa và Học kỳ để thống kê.", "warning");
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({ hoc_ky_id: hocKyId });
      if (khoaId) qs.set("khoa_id", khoaId);
      if (nganhId) qs.set("nganh_id", nganhId);

      const [ovRes, theoKhoaRes, theoNganhRes, taiGVRes] = await Promise.all([
        fetch(`${API}/bao-cao/overview?${qs.toString()}`),
        fetch(`${API}/bao-cao/dk-theo-khoa?hoc_ky_id=${hocKyId}`),
        fetch(
          `${API}/bao-cao/dk-theo-nganh?hoc_ky_id=${hocKyId}${
            khoaId ? `&khoa_id=${khoaId}` : ""
          }`
        ),
        fetch(
          `${API}/bao-cao/tai-giang-vien?hoc_ky_id=${hocKyId}${
            khoaId ? `&khoa_id=${khoaId}` : ""
          }`
        ),
      ]);

      const [ovJ, khoaJ, nganhJ, gvJ] = await Promise.all([
        safeJson(ovRes),
        safeJson(theoKhoaRes),
        safeJson(theoNganhRes),
        safeJson(taiGVRes),
      ]);

      const ov = ovJ?.data as OverviewPayload;
      setOverview(ov || null);
      setDkTheoKhoa(khoaJ?.data?.data || []);
      setKetLuanKhoa(khoaJ?.data?.ketLuan || "");
      setDkTheoNganh(nganhJ?.data?.data || []);
      setKetLuanNganh(nganhJ?.data?.ketLuan || "");
      setTaiGV(gvJ?.data?.data || []);
      setKetLuanGV(gvJ?.data?.ketLuan || "");
    } catch (e: any) {
      console.error(e);
      openNotify(`Lỗi tải thống kê: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!hocKyId) {
      openNotify("Chưa chọn học kỳ.", "warning");
      return;
    }
    try {
      const qs = new URLSearchParams({ hoc_ky_id: hocKyId });
      if (khoaId) qs.set("khoa_id", khoaId);
      if (nganhId) qs.set("nganh_id", nganhId);

      const res = await fetch(`${API}/bao-cao/export/excel?${qs.toString()}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao_cao_${hocKyId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      openNotify(`Xuất Excel lỗi: ${e.message}`, "error");
    }
  };

  const exportPDF = async () => {
    if (!hocKyId) {
      openNotify("Chưa chọn học kỳ.", "warning");
      return;
    }
    try {
      const charts: { name: string; dataUrl: string }[] = [];

      if (refKhoa.current) {
        charts.push({
          name: "Đăng ký theo khoa",
          dataUrl: await getChartPNGFromContainer(refKhoa.current),
        });
      }
      if (refNganh.current) {
        charts.push({
          name: "Đăng ký theo ngành",
          dataUrl: await getChartPNGFromContainer(refNganh.current),
        });
      }
      if (refGV.current) {
        charts.push({
          name: "Tải giảng viên (Top)",
          dataUrl: await getChartPNGFromContainer(refGV.current),
        });
      }
      if (refFinance.current) {
        charts.push({
          name: "Tài chính học phí",
          dataUrl: await getChartPNGFromContainer(refFinance.current),
        });
      }

      const body = {
        hoc_ky_id: hocKyId,
        khoa_id: khoaId || null,
        nganh_id: nganhId || null,
        charts,
      };

      const res = await fetch(`${API}/bao-cao/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao_cao_${hocKyId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      openNotify(`Xuất PDF lỗi: ${e.message}`, "error");
    }
  };

  // finance chart data
  const financeData = useMemo(() => {
    if (!overview) return [];
    return [
      {
        name: "Học phí",
        "Thực thu": overview.taiChinh.thuc_thu,
        "Kỳ vọng": overview.taiChinh.ky_vong,
      },
    ];
  }, [overview]);

  // UI
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Thống kê & Báo cáo</h2>

      {/* Filters */}
      <div
        className="df"
        style={{
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {/* Niên khóa */}
        <select
          value={nkId}
          onChange={(e) => {
            setNkId(e.target.value);
            setHocKyId("");
          }}
        >
          <option value="">-- Chọn niên khóa --</option>
          {nienKhoas.map((nk) => (
            <option key={nk.id} value={nk.id}>
              {nk.ten_nien_khoa}
            </option>
          ))}
        </select>

        {/* Học kỳ */}
        <select
          value={hocKyId}
          onChange={(e) => setHocKyId(e.target.value)}
          disabled={!nkId}
        >
          <option value="">-- Chọn học kỳ --</option>
          {hocKysByNK.map((hk) => (
            <option key={hk.id} value={hk.id}>
              {hk.ten_hoc_ky}
            </option>
          ))}
        </select>

        {/* Khoa */}
        <select
          value={khoaId}
          onChange={(e) => {
            setKhoaId(e.target.value);
            setNganhId("");
          }}
        >
          <option value="">-- Tất cả khoa --</option>
          {khoas.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ten_khoa}
            </option>
          ))}
        </select>

        {/* Ngành */}
        <select
          value={nganhId}
          onChange={(e) => setNganhId(e.target.value)}
          disabled={!khoaId}
        >
          <option value="">-- Tất cả ngành --</option>
          {filteredNganhs.map((n) => (
            <option key={n.id} value={n.id}>
              {n.ten_nganh}
            </option>
          ))}
        </select>

        <button onClick={loadReports} className="btn__primary">
          Tải thống kê
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={exportExcel} className="btn__secondary">
          Xuất Excel
        </button>
        <button onClick={exportPDF} className="btn__secondary">
          Xuất PDF
        </button>
      </div>

      {/* Overview cards */}
      {overview && (
        <div
          className="df"
          style={{
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <StatCard label="SV đã đăng ký (unique)" value={overview.svUnique} />
          <StatCard label="Bản ghi đăng ký" value={overview.soDK} />
          <StatCard label="Lớp học phần mở" value={overview.soLHP} />
          <StatCard
            label="Thực thu"
            value={currency(overview.taiChinh.thuc_thu)}
          />
          <StatCard
            label="Kỳ vọng"
            value={currency(overview.taiChinh.ky_vong)}
          />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          {/* Đăng ký theo khoa */}
          <section style={{ margin: "12px 0" }}>
            <h3>Đăng ký theo khoa</h3>
            <div
              ref={refKhoa}
              style={{ width: "100%", height: 320, background: "#fff" }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={dkTheoKhoa}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ten_khoa"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="so_dang_ky" name="Số đăng ký" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {ketLuanKhoa && (
              <p style={{ marginTop: 6 }}>
                <b>Kết luận:</b> {ketLuanKhoa}
              </p>
            )}
          </section>

          {/* Đăng ký theo ngành */}
          <section style={{ margin: "12px 0" }}>
            <h3>
              Đăng ký theo ngành {khoaId ? "(lọc theo khoa đã chọn)" : ""}
            </h3>
            <div
              ref={refNganh}
              style={{ width: "100%", height: 320, background: "#fff" }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={dkTheoNganh}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ten_nganh"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="so_dang_ky" name="Số đăng ký" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {ketLuanNganh && (
              <p style={{ marginTop: 6 }}>
                <b>Kết luận:</b> {ketLuanNganh}
              </p>
            )}
          </section>

          {/* Tải giảng viên */}
          <section style={{ margin: "12px 0" }}>
            <h3>Tải giảng viên {khoaId ? "(lọc theo khoa đã chọn)" : ""}</h3>
            <div
              ref={refGV}
              style={{ width: "100%", height: 360, background: "#fff" }}
            >
              <ResponsiveContainer>
                {/* Vertical bar: dùng tên GV ở trục Y */}
                <BarChart
                  data={taiGV.slice(0, 10).reverse()} // top 10, đảo để tên ngắn gọn
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="ho_ten" width={180} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="so_lop" name="Số lớp" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {ketLuanGV && (
              <p style={{ marginTop: 6 }}>
                <b>Kết luận:</b> {ketLuanGV}
              </p>
            )}
          </section>

          {/* Tài chính */}
          <section style={{ margin: "12px 0" }}>
            <h3>Tài chính học phí</h3>
            <div
              ref={refFinance}
              style={{ width: "100%", height: 320, background: "#fff" }}
            >
              <ResponsiveContainer>
                <LineChart
                  data={financeData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => currency(Number(v))} />
                  <Legend />
                  {/* Nếu muốn Bars thay vì Lines: thêm BarChart/ComposedChart; ở đây mix Line cho gọn */}
                  <Line type="monotone" dataKey="Thực thu" />
                  <Line type="monotone" dataKey="Kỳ vọng" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {overview?.ketLuan && (
              <p style={{ marginTop: 6 }}>
                <b>Kết luận:</b> {overview.ketLuan}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ====== Small UI piece ====== */
function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        minWidth: 220,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
