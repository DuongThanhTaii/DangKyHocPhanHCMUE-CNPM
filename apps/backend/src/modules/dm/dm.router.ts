import { Router } from "express";
import { UnitOfWork } from "../../repositories/unitOfWork";
import { ServiceResultBuilder } from "../../types/serviceResult";
import { requireAuth } from "../../middlewares/auth"; // tuỳ bạn có muốn bắt buộc hay không

const r = Router();
const uow = UnitOfWork.getInstance();

// GET /api/dm/khoa
r.get(
  "/khoa",
  /* requireAuth, */ async (_req, res) => {
    try {
      const items = await uow.khoaRepository.listAll(true);
      res.json(ServiceResultBuilder.success("OK", items));
    } catch (e: any) {
      res
        .status(500)
        .json(
          ServiceResultBuilder.failure(e?.message ?? "Lỗi tải danh mục khoa")
        );
    }
  }
);

// GET /api/dm/nganh?khoa_id=...
r.get(
  "/nganh",
  /* requireAuth, */ async (req, res) => {
    try {
      const khoa_id =
        typeof req.query.khoa_id === "string" ? req.query.khoa_id : undefined;
      const items = await uow.nganhRepository.listAll({ khoa_id });
      res.json(ServiceResultBuilder.success("OK", items));
    } catch (e: any) {
      res
        .status(500)
        .json(
          ServiceResultBuilder.failure(e?.message ?? "Lỗi tải danh mục ngành")
        );
    }
  }
);

export default r;
