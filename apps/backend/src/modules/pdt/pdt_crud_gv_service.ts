import { Request, Response } from "express";
import { UnitOfWork } from "../../repositories/unitOfWork";
import { ServiceResultBuilder } from "../../types/serviceResult";

const uow = UnitOfWork.getInstance();

// Lấy danh sách
export const getAllGiangVienHandler = async (_req: Request, res: Response) => {
  try {
    const items = await uow.giangVienRepository.findAll();
    res.json(ServiceResultBuilder.success("OK", { items }));
  } catch (err: any) {
    res.status(500).json(ServiceResultBuilder.failure(err.message));
  }
};

// Lấy chi tiết
export const getGiangVienByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await uow.giangVienRepository.findById(id);
    if (!item)
      return res
        .status(404)
        .json(ServiceResultBuilder.failure("Không tìm thấy giảng viên"));
    res.json(ServiceResultBuilder.success("OK", item));
  } catch (err: any) {
    res.status(500).json(ServiceResultBuilder.failure(err.message));
  }
};

// Tạo mới
export const createGiangVienHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const created = await uow.giangVienRepository.create(body);
    res.json(ServiceResultBuilder.success("Đã tạo giảng viên", created));
  } catch (err: any) {
    res.status(500).json(ServiceResultBuilder.failure(err.message));
  }
};

// Cập nhật
export const updateGiangVienHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await uow.giangVienRepository.update(id, body);
    res.json(ServiceResultBuilder.success("Đã cập nhật giảng viên", updated));
  } catch (err: any) {
    res.status(500).json(ServiceResultBuilder.failure(err.message));
  }
};

// Xoá
export const deleteGiangVienHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await uow.giangVienRepository.delete(id);
    res.json(ServiceResultBuilder.success("Đã xoá giảng viên"));
  } catch (err: any) {
    res.status(500).json(ServiceResultBuilder.failure(err.message));
  }
};
