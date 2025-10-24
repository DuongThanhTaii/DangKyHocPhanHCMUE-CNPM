import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/reset.css";
import "../../styles/menu.css";
import { fetchJSON } from "../../utils/fetchJSON";
import { useModalContext } from "../../hook/ModalContext";

type Info = {
  id: string;
  ma_lop: string;
  hoc_phan: {
    ten_hoc_phan: string;
    mon_hoc: { ma_mon: string; ten_mon: string };
  };
};
type DocRow = {
  id: string;
  ten_tai_lieu: string;
  file_path: string;
  created_at?: string;
};
type SVRow = {
  sinh_vien_id: string;
  mssv: string;
  ho_ten: string;
  email: string;
  lop?: string | null;
};

export default function GVLopHocPhanDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<Info | null>(null);

  const [tab, setTab] = useState<"docs" | "sv" | "grades">("docs");

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [svs, setSvs] = useState<SVRow[]>([]);
  const [grades, setGrades] = useState<Record<string, number | "">>({});
  const { openNotify, openConfirm } = useModalContext();

  // loaders
  const loadInfo = async () => {
    const r = await fetchJSON(`/api/gv/lop-hoc-phan/${id}`);
    setInfo(r.data);
  };
  const loadDocs = async () => {
    const r = await fetchJSON(`/gv/lop-hoc-phan/${id}/tai-lieu`);
    setDocs(r.data || []);
  };
  const loadSVs = async () => {
    const r = await fetchJSON(`/gv/lop-hoc-phan/${id}/sinh-vien`);
    setSvs(r.data || []);
  };
  const loadGrades = async () => {
    const r = await fetchJSON(`/gv/lop-hoc-phan/${id}/diem`);
    const map: Record<string, number | ""> = {};
    (r.data || []).forEach((g: any) => (map[g.sinh_vien_id] = g.diem_so ?? ""));
    setGrades(map);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadInfo(), loadDocs(), loadSVs(), loadGrades()]);
      setLoading(false);
    })();
  }, [id]);

  // actions
  const onUploadDoc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as any;
    const ten = form.ten.value.trim();
    const path = form.path.value.trim();
    if (!ten || !path) return openNotify("Thiếu tên hoặc đường dẫn", "warning");
    const ok = await openConfirm({ message: `Đăng tài liệu "${ten}"?` });
    if (!ok) return;
    await fetchJSON(`/api/gv/lop-hoc-phan/${id}/tai-lieu`, {
      method: "POST",
      body: JSON.stringify({ ten_tai_lieu: ten, file_path: path }),
    });
    openNotify("Đã đăng tài liệu", "success");
    form.reset();
    loadDocs();
  };

  const onSaveGrades = async () => {
    const items = Object.entries(grades)
      .filter(([, v]) => v !== "")
      .map(([sinh_vien_id, diem_so]) => ({
        sinh_vien_id,
        diem_so: Number(diem_so),
      }));
    const ok = await openConfirm({
      message: "Lưu điểm cho lớp này?",
      confirmText: "Lưu",
    });
    if (!ok) return;
    await fetchJSON(`/api/gv/lop-hoc-phan/${id}/diem`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    });
    openNotify("Đã lưu điểm", "success");
    loadGrades();
  };

  return (
    <section className="main__body">
      <div className="body__title">
        <p className="body__title-text">
          {info
            ? `QUẢN LÝ LỚP ${info.ma_lop} — ${info.hoc_phan.mon_hoc.ma_mon} ${info.hoc_phan.mon_hoc.ten_mon}`
            : "QUẢN LÝ LỚP HỌC PHẦN"}
        </p>
      </div>

      <div className="body__inner">
        {loading && (
          <p style={{ textAlign: "center", padding: 20 }}>
            Đang tải dữ liệu...
          </p>
        )}

        {!loading && info && (
          <>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button
                className={tab === "docs" ? "active" : ""}
                onClick={() => setTab("docs")}
              >
                Tài liệu
              </button>
              <button
                className={tab === "sv" ? "active" : ""}
                onClick={() => setTab("sv")}
              >
                Sinh viên
              </button>
              <button
                className={tab === "grades" ? "active" : ""}
                onClick={() => setTab("grades")}
              >
                Điểm
              </button>
            </div>

            {/* Tài liệu */}
            {tab === "docs" && (
              <div>
                <form
                  onSubmit={onUploadDoc}
                  className="row gap"
                  style={{ marginBottom: 12 }}
                >
                  <input name="ten" placeholder="Tên tài liệu" />
                  <input name="path" placeholder="Đường dẫn file (S3/local…)" />
                  <button type="submit">Đăng</button>
                </form>

                <div className="table__wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>File</th>
                        <th>Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((d) => (
                        <tr key={d.id}>
                          <td>{d.ten_tai_lieu}</td>
                          <td>
                            <a href={d.file_path} target="_blank">
                              {d.file_path}
                            </a>
                          </td>
                          <td>
                            {d.created_at?.slice(0, 19).replace("T", " ")}
                          </td>
                        </tr>
                      ))}
                      {docs.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            Chưa có tài liệu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sinh viên */}
            {tab === "sv" && (
              <div className="table__wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Lớp</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {svs.map((s) => (
                      <tr key={s.sinh_vien_id}>
                        <td>{s.mssv}</td>
                        <td>{s.ho_ten}</td>
                        <td>{s.lop || ""}</td>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                    {svs.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ textAlign: "center", padding: 20 }}
                        >
                          Chưa có sinh viên đăng ký.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Điểm */}
            {tab === "grades" && (
              <div>
                <div className="table__wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>MSSV</th>
                        <th>Họ tên</th>
                        <th>Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {svs.map((s) => (
                        <tr key={s.sinh_vien_id}>
                          <td>{s.mssv}</td>
                          <td>{s.ho_ten}</td>
                          <td style={{ maxWidth: 120 }}>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={grades[s.sinh_vien_id] ?? ""}
                              onChange={(e) =>
                                setGrades((g) => ({
                                  ...g,
                                  [s.sinh_vien_id]:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {svs.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            Không có sinh viên để nhập điểm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={onSaveGrades}>Lưu điểm</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
