import { Request, Response } from "express";
import { UnitOfWork } from "../../repositories/unitOfWork";
import { ServiceResultBuilder } from "../../types/serviceResult";
import { TCreateMonHocDTO, TUpdateMonHocDTO } from "../../dtos/monHocDTO";

const uow = UnitOfWork.getInstance();

// GET /pdt/mon-hoc
export const listMonHocHandler = async (req: Request, res: Response) => {
  try {
    const { q, khoa_id, loai_mon, la_mon_chung, nganh_id } =
      req.query as Record<string, string>;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);

    const { items, total } = await uow.monHocRepository.findPaged({
      q,
      khoa_id,
      loai_mon,
      la_mon_chung:
        typeof la_mon_chung !== "undefined"
          ? la_mon_chung === "true"
          : undefined,
      nganh_id,
      page,
      pageSize,
    });

    res.json(
      ServiceResultBuilder.success("OK", { items, total, page, pageSize })
    );
  } catch (e: any) {
    res
      .status(500)
      .json(
        ServiceResultBuilder.failure(e?.message ?? "Tải danh sách thất bại")
      );
  }
};

// GET /pdt/mon-hoc/:id
export const detailMonHocHandler = async (req: Request, res: Response) => {
  try {
    const row = await uow.monHocRepository.findById(req.params.id);
    if (!row)
      return res
        .status(404)
        .json(ServiceResultBuilder.failure("Không tìm thấy môn học"));
    res.json(ServiceResultBuilder.success("OK", row));
  } catch (e: any) {
    res
      .status(500)
      .json(
        ServiceResultBuilder.failure(e?.message ?? "Tải chi tiết thất bại")
      );
  }
};

// POST /pdt/mon-hoc
export const createMonHocHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body as TCreateMonHocDTO;

    // kiểm tra cơ bản
    if (!body.ma_mon || !body.ten_mon || !body.so_tin_chi || !body.khoa_id) {
      return res
        .status(400)
        .json(
          ServiceResultBuilder.failure(
            "Thiếu ma_mon / ten_mon / so_tin_chi / khoa_id"
          )
        );
    }
    if (body.so_tin_chi <= 0) {
      return res
        .status(400)
        .json(ServiceResultBuilder.failure("so_tin_chi phải > 0"));
    }

    // unique ma_mon
    const existed = await uow.monHocRepository.findByMaMon(body.ma_mon);
    if (existed)
      return res
        .status(400)
        .json(ServiceResultBuilder.failure("Mã môn đã tồn tại"));

    const id = await uow.monHocRepository.create({
      ma_mon: body.ma_mon,
      ten_mon: body.ten_mon,
      so_tin_chi: body.so_tin_chi,
      khoa_id: body.khoa_id,
      loai_mon: body.loai_mon,
      la_mon_chung: body.la_mon_chung,
      thu_tu_hoc: body.thu_tu_hoc,
      nganh_ids: body.nganh_ids,
      dieu_kien: body.dieu_kien,
    });

    // load lại detail để trả về đầy đủ
    const detail = await uow.monHocRepository.findById(id.ma_mon); // ✅ Dùng id trực tiếp
    res.json(ServiceResultBuilder.success("Đã tạo môn học", detail));
  } catch (e: any) {
    res
      .status(500)
      .json(ServiceResultBuilder.failure(e?.message ?? "Tạo thất bại"));
  }
};

// PUT /pdt/mon-hoc/:id
export const updateMonHocHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body as TUpdateMonHocDTO;
    const id = req.params.id;

    if (typeof body.so_tin_chi === "number" && body.so_tin_chi <= 0) {
      return res
        .status(400)
        .json(ServiceResultBuilder.failure("so_tin_chi phải > 0"));
    }

    // nếu cho phép đổi ma_mon thì cần check unique
    if (body.ma_mon) {
      const existed = await uow.monHocRepository.findByMaMon(body.ma_mon);
      if (existed && existed.id !== id) {
        return res
          .status(400)
          .json(ServiceResultBuilder.failure("Mã môn đã tồn tại"));
      }
    }

    await uow.monHocRepository.update(id, {
      ma_mon: body.ma_mon,
      ten_mon: body.ten_mon,
      so_tin_chi: body.so_tin_chi,
      khoa_id: body.khoa_id,
      loai_mon: body.loai_mon,
      la_mon_chung: body.la_mon_chung,
      thu_tu_hoc: body.thu_tu_hoc,
      nganh_ids: body.nganh_ids ?? null, // null = không đụng; [] = xoá hết
      dieu_kien: body.dieu_kien ?? null, // null = không đụng; [] = xoá hết
    });

    const detail = await uow.monHocRepository.findById(id); // ✅ Dùng id trực tiếp
    res.json(ServiceResultBuilder.success("Đã cập nhật môn học", detail));
  } catch (e: any) {
    res
      .status(500)
      .json(ServiceResultBuilder.failure(e?.message ?? "Cập nhật thất bại"));
  }
};

// DELETE /pdt/mon-hoc/:id
export const deleteMonHocHandler = async (req: Request, res: Response) => {
  try {
    await uow.monHocRepository.delete(req.params.id); // ✅ Bỏ { force }
    res.json(ServiceResultBuilder.success("Đã xoá môn học"));
  } catch (e: any) {
    res
      .status(400)
      .json(ServiceResultBuilder.failure(e?.message ?? "Xoá thất bại"));
  }
};
