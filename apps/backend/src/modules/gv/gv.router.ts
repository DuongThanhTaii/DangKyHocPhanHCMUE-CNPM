import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { gvLopHocPhanService as svc } from "../../services/gvLopHocPhanService";

const r = Router();

r.get("/me", requireAuth, requireRole(["giang_vien"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

// Lấy các LHP mà GV phụ trách
r.get("/lop-hoc-phan", async (req, res) => {
  const gvUserId = req.auth!.sub; // users.id
  const data = await svc.listMine(gvUserId);
  res.json({ ok: true, data });
});

// Chi tiết 1 LHP
r.get("/lop-hoc-phan/:id", async (req, res) => {
  const data = await svc.detail(req.params.id, req.auth!.sub);
  res.json({ ok: true, data });
});

// Danh sách sinh viên đã đăng ký LHP
r.get("/lop-hoc-phan/:id/sinh-vien", async (req, res) => {
  const rows = await svc.students(req.params.id, req.auth!.sub);
  // map gọn dữ liệu
  const data = rows.map((d) => ({
    sinh_vien_id: d.sinh_vien_id,
    mssv: d.sinh_vien.ma_so_sinh_vien,
    ho_ten: d.sinh_vien.users.ho_ten,
    email: d.sinh_vien.users.email,
    lop: d.sinh_vien.lop,
    khoa: d.sinh_vien.khoa.ten_khoa,
    nganh: d.sinh_vien.nganh_hoc?.ten_nganh ?? null,
  }));
  res.json({ ok: true, data });
});

// Tài liệu
r.get("/lop-hoc-phan/:id/tai-lieu", async (req, res) => {
  const rows = await svc.documents(req.params.id, req.auth!.sub);
  res.json({ ok: true, data: rows });
});
r.post("/lop-hoc-phan/:id/tai-lieu", async (req, res) => {
  // giả định đã upload file ở nơi khác, ở đây chỉ lưu metadata file_path
  const { ten_tai_lieu, file_path, file_type } = req.body;
  const doc = await svc.createDocument(req.params.id, req.auth!.sub, {
    ten_tai_lieu,
    file_path,
    file_type,
  });
  res.json({ ok: true, data: doc });
});
r.delete("/lop-hoc-phan/:id/tai-lieu/:docId", async (req, res) => {
  await svc.deleteDocument(req.params.id, req.params.docId, req.auth!.sub);
  res.json({ ok: true });
});

// Điểm
r.get("/lop-hoc-phan/:id/diem", async (req, res) => {
  const { rows } = await svc.getGrades(req.params.id, req.auth!.sub);
  res.json({ ok: true, data: rows });
});
r.put("/lop-hoc-phan/:id/diem", async (req, res) => {
  // body: {items:[{sinh_vien_id, diem_so}]}
  await svc.upsertGrades(req.params.id, req.auth!.sub, req.body.items || []);
  res.json({ ok: true });
});

export default r;
