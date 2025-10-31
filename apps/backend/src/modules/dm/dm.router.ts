import { Router } from "express";
import {
  getAllKhoaHandler,
  getAllNganhHandler,
  getAllCoSoHandler,
  getNganhChuaCoChinhSachHandler,
} from "./dm_service";

const r = Router();

// ✅ Lấy danh sách khoa
r.get("/khoa", getAllKhoaHandler);

// ✅ Lấy danh sách ngành (có thể filter theo khoa)
r.get("/nganh", getAllNganhHandler);

// ✅ Lấy danh sách ngành chưa có chính sách tín chỉ (cho form thêm chính sách)
r.get("/nganh/chua-co-chinh-sach", getNganhChuaCoChinhSachHandler);

// ✅ Lấy danh sách cơ sở
r.get("/co-so", getAllCoSoHandler);

export default r;
