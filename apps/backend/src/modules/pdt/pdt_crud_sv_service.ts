import express from "express";
import { UnitOfWork } from "../../repositories/unitOfWork";
import { SinhVienService } from "../../services/sinhVienService";
import { CreateSinhVienDTO, UpdateSinhVienDTO } from "../../dtos/sinhvienDTO";

const router = express.Router();
const uow = UnitOfWork.getInstance();
const service = new SinhVienService(uow);

// GET /pdt/sinh-vien?page=1&pageSize=20&q=abc
router.get("/", async (req, res) => {
  const page = parseInt(String(req.query.page ?? 1), 10);
  const pageSize = parseInt(String(req.query.pageSize ?? 20), 10);
  const q = req.query.q ? String(req.query.q) : undefined;
  const result = await service.list(page, pageSize, q);
  res.json(result);
});

// GET /pdt/sinh-vien/:id
router.get("/:id", async (req, res) => {
  const result = await service.detail(req.params.id);
  res.status(result.isSuccess ? 200 : 404).json(result);
});

// POST /pdt/sinh-vien
router.post("/", async (req, res) => {
  const parsed = CreateSinhVienDTO.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, message: parsed.error.flatten() });
  const result = await service.create(parsed.data);
  res.status(result.isSuccess ? 200 : 400).json(result);
});

// PUT /pdt/sinh-vien/:id
router.put("/:id", async (req, res) => {
  const parsed = UpdateSinhVienDTO.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, message: parsed.error.flatten() });
  const result = await service.update(req.params.id, parsed.data);
  res.status(result.isSuccess ? 200 : 400).json(result);
});

// DELETE /pdt/sinh-vien/:id
router.delete("/:id", async (req, res) => {
  const result = await service.remove(req.params.id);
  res.status(result.isSuccess ? 200 : 404).json(result);
});

export default router;
