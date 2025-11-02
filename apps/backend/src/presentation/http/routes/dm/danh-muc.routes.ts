import { Router } from "express";
import { DanhMucController } from "../../controllers/dm/DanhMucController";

const router = Router();
const controller = new DanhMucController();

// ✅ Lấy danh sách khoa
router.get("/khoa", controller.getAllKhoa);

// ✅ Lấy danh sách ngành (có thể filter theo khoa)
router.get("/nganh", controller.getAllNganh);

// ✅ Lấy danh sách ngành chưa có chính sách tín chỉ (cho form thêm chính sách)
router.get("/nganh/chua-co-chinh-sach", controller.getNganhChuaCoChinhSach);

// ✅ Lấy danh sách cơ sở
router.get("/co-so", controller.getAllCoSo);

export default router;
