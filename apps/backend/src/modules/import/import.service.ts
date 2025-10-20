// apps/backend/src/modules/import/import.service.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UnitOfWork } from "../../repositories/unitOfWork";
import { readFirstSheetRows } from "./parseExcel";

// ==============================
// Limiter CJS-compatible (thay cho p-limit)
// ==============================
function createLimiter(concurrency: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= concurrency) return;
    const run = queue.shift();
    if (!run) return;
    active++;
    run();
  };

  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = () => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      };
      queue.push(task);
      next();
    });
  };
}

const limit = createLimiter(5); // chỉnh concurrency tại đây

// ==============================
// UoW
// ==============================
const uow = UnitOfWork.getInstance();

// ==============================
// Helper resolve danh mục
// Chú ý: các hàm dưới dùng method giả định của repository.
// Nếu code bạn đặt tên khác, đổi lại cho khớp.
// ==============================
async function resolveKhoaId(input: { khoa_id?: string; ma_khoa?: string }) {
  if (input.khoa_id) return String(input.khoa_id);

  if (input.ma_khoa) {
    const ma = String(input.ma_khoa).trim();
    // Giả định có method findByMaKhoa
    const row = await uow.khoaRepository.findByMaKhoa(ma);
    if (!row) throw new Error(`Không tìm thấy Khoa với ma_khoa=${ma}`);
    return row.id;
  }

  throw new Error("Thiếu khoa_id hoặc ma_khoa");
}

async function resolveNganhIds(
  input: { nganh_ids?: string[]; ma_nganh_list?: string },
  khoa_id?: string
) {
  if (input.nganh_ids?.length) return input.nganh_ids.map(String);

  if (!input.ma_nganh_list) return [];
  const codes = String(input.ma_nganh_list)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (codes.length === 0) return [];

  // Tối ưu: load theo khoa để giảm diện tìm
  // Giả định có method listByKhoa({khoa_id?: string})
  const all = await uow.nganhRepository.listByKhoa(khoa_id ? { khoa_id } : {});
  const out: string[] = [];
  for (const code of codes) {
    // Giả định có method findByMaNganh — nếu không có, thay bằng tìm trong mảng all
    const found = all.find(
      (n: any) => String(n.ma_nganh || "").toLowerCase() === code.toLowerCase()
    );
    if (!found) throw new Error(`Không tìm thấy Ngành với ma_nganh=${code}`);
    out.push(found.id);
  }
  return out;
}

async function resolveMonIdsFromCodes(codes: string[]) {
  // Tối ưu: bạn có thể viết monHocRepository.findManyByMaMon(codes)
  // Ở đây loop từng mã để đơn giản.
  const map: Record<string, string> = {};
  for (const code of codes) {
    const mh = await uow.monHocRepository.findByMaMon(code);
    if (!mh) throw new Error(`Không tìm thấy môn với ma_mon=${code}`);
    map[code] = mh.id;
  }
  return map;
}

// ==============================
// 1) Import Sinh viên
// ==============================
export const importSinhVienHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Thiếu file 'file'" });
    }

    const rows = readFirstSheetRows(req.file.buffer);
    const results: Array<{
      row: number;
      status: string;
      key?: string;
      error?: string;
    }> = [];

    await Promise.all(
      rows.map((raw, idx) =>
        limit(async () => {
          const rowNo = idx + 2; // header là dòng 1
          try {
            const ma_so_sinh_vien = String(raw.ma_so_sinh_vien || "").trim();
            const ho_ten = String(raw.ho_ten || "").trim();
            if (!ma_so_sinh_vien || !ho_ten) {
              throw new Error("Thiếu ma_so_sinh_vien/ho_ten");
            }

            const khoa_id = await resolveKhoaId({
              khoa_id: raw.khoa_id,
              ma_khoa: raw.ma_khoa,
            });

            // SV hiện tại schema 1 ngành → lấy phần tử đầu
            const nganh_ids = await resolveNganhIds(
              {
                nganh_ids: Array.isArray(raw.nganh_ids)
                  ? raw.nganh_ids
                  : undefined,
                ma_nganh_list: raw.ma_nganh_list || raw.ma_nganh || undefined,
              },
              khoa_id
            );
            const nganh_id = nganh_ids[0] || undefined;

            // Mật khẩu mặc định: MSSV (hoặc '123456' tuỳ policy)
            const rawPassword = raw.mat_khau
              ? String(raw.mat_khau)
              : ma_so_sinh_vien;
            const passHash = await bcrypt.hash(rawPassword, 10);

            await uow.transaction(async (tx) => {
              // 1) tai_khoan
              const tk = await tx.tai_khoan.create({
                data: {
                  ten_dang_nhap: ma_so_sinh_vien,
                  mat_khau: passHash,
                  loai_tai_khoan: "sinh_vien",
                  trang_thai_hoat_dong: true,
                },
              });

              // 2) users
              const u = await tx.users.create({
                data: {
                  id: tk.id,
                  ho_ten,
                  tai_khoan_id: tk.id,
                  ma_nhan_vien: ma_so_sinh_vien,
                  email: `${ma_so_sinh_vien}@student.hcmue.edu.vn`
                    .toLowerCase()
                    .trim(),
                },
              });

              // 3) sinh_vien
              await tx.sinh_vien.create({
                data: {
                  id: u.id,
                  ma_so_sinh_vien,
                  lop: raw.lop ? String(raw.lop) : null,
                  khoa_id,
                  khoa_hoc: raw.khoa_hoc ? String(raw.khoa_hoc) : null,
                  ngay_nhap_hoc: raw.ngay_nhap_hoc
                    ? new Date(raw.ngay_nhap_hoc)
                    : null,
                  nganh_id: nganh_id || null,
                },
              });
            });

            results.push({
              row: rowNo,
              status: "created",
              key: ma_so_sinh_vien,
            });
          } catch (e: any) {
            results.push({
              row: rowNo,
              status: "failed",
              error: e?.message || "Lỗi không xác định",
            });
          }
        })
      )
    );

    const summary = {
      total: rows.length,
      created: results.filter((r) => r.status === "created").length,
      failed: results.filter((r) => r.status === "failed").length,
    };
    return res.json({
      isSuccess: true,
      message: "Imported",
      data: { summary, results },
    });
  } catch (e: any) {
    return res.status(500).json({
      isSuccess: false,
      message: e?.message || "Import thất bại",
    });
  }
};

// ==============================
// 2) Import Giảng viên
// ==============================
export const importGiangVienHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Thiếu file 'file'" });
    }

    const rows = readFirstSheetRows(req.file.buffer);
    const results: Array<{
      row: number;
      status: string;
      key?: string;
      error?: string;
    }> = [];

    await Promise.all(
      rows.map((raw, idx) =>
        limit(async () => {
          const rowNo = idx + 2;
          try {
            // ma_gv có thể nằm ở cột ma_gv hoặc ten_dang_nhap
            const ma_gv = String(raw.ma_gv || raw.ten_dang_nhap || "").trim();
            const ho_ten = String(raw.ho_ten || "").trim();
            if (!ma_gv || !ho_ten) {
              throw new Error("Thiếu ma_gv/ho_ten");
            }

            const khoa_id = await resolveKhoaId({
              khoa_id: raw.khoa_id,
              ma_khoa: raw.ma_khoa,
            });

            const rawPassword = raw.mat_khau ? String(raw.mat_khau) : ma_gv;
            const passHash = await bcrypt.hash(rawPassword, 10);

            await uow.transaction(async (tx) => {
              // 1) tai_khoan
              const tk = await tx.tai_khoan.create({
                data: {
                  ten_dang_nhap: ma_gv,
                  mat_khau: passHash,
                  loai_tai_khoan: "giang_vien",
                  trang_thai_hoat_dong: true,
                },
              });

              // 2) users
              const u = await tx.users.create({
                data: {
                  id: tk.id,
                  ho_ten,
                  ma_nhan_vien: ma_gv,
                  tai_khoan_id: tk.id,
                  email: `${ma_gv}@hcmue.edu.vn`.toLowerCase().trim(),
                },
              });

              // 3) giang_vien
              await tx.giang_vien.create({
                data: {
                  id: u.id,
                  khoa_id,
                  trinh_do: raw.trinh_do ? String(raw.trinh_do) : null,
                  chuyen_mon: raw.chuyen_mon ? String(raw.chuyen_mon) : null,
                  kinh_nghiem_giang_day: raw.kinh_nghiem_giang_day
                    ? Number(raw.kinh_nghiem_giang_day)
                    : 0,
                },
              });
            });

            results.push({ row: rowNo, status: "created", key: ma_gv });
          } catch (e: any) {
            results.push({
              row: rowNo,
              status: "failed",
              error: e?.message || "Lỗi không xác định",
            });
          }
        })
      )
    );

    const summary = {
      total: rows.length,
      created: results.filter((r) => r.status === "created").length,
      failed: results.filter((r) => r.status === "failed").length,
    };
    return res.json({
      isSuccess: true,
      message: "Imported",
      data: { summary, results },
    });
  } catch (e: any) {
    return res.status(500).json({
      isSuccess: false,
      message: e?.message || "Import thất bại",
    });
  }
};

// ==============================
// 3) Import Môn học
// ==============================
export const importMonHocHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Thiếu file 'file'" });
    }

    const rows = readFirstSheetRows(req.file.buffer);
    const results: Array<{
      row: number;
      status: string;
      key?: string;
      id?: string;
      error?: string;
    }> = [];

    await Promise.all(
      rows.map((raw, idx) =>
        limit(async () => {
          const rowNo = idx + 2;
          try {
            const ma_mon = String(raw.ma_mon || "").trim();
            const ten_mon = String(raw.ten_mon || "").trim();
            const so_tin_chi = Number(raw.so_tin_chi);
            if (!ma_mon || !ten_mon || !so_tin_chi) {
              throw new Error("Thiếu ma_mon/ten_mon/so_tin_chi");
            }

            const khoa_id = await resolveKhoaId({
              khoa_id: raw.khoa_id,
              ma_khoa: raw.ma_khoa,
            });

            const nganh_ids = await resolveNganhIds(
              {
                nganh_ids: Array.isArray(raw.nganh_ids)
                  ? raw.nganh_ids
                  : undefined,
                ma_nganh_list: raw.ma_nganh_list || raw.ma_nganh || undefined,
              },
              khoa_id
            );

            // điều kiện: cột "mon_dk_list" dạng "CTDL:tien_quyet;THCS:song_hanh"
            let dieu_kien:
              | { mon_lien_quan_id: string; loai: string; bat_buoc?: boolean }[]
              | undefined;

            if (raw.mon_dk_list) {
              const parts = String(raw.mon_dk_list)
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);

              const allCodes = parts.map((p) => String(p.split(":")[0]).trim());
              const codeToId = await resolveMonIdsFromCodes(allCodes);

              dieu_kien = parts.map((p) => {
                const [code, loaiRaw] = p.split(":");
                const loai = (loaiRaw || "tien_quyet").trim();
                const mon_lien_quan_id = codeToId[String(code).trim()];
                if (!mon_lien_quan_id) {
                  throw new Error(
                    `mon_dk_list: không resolve được mã môn ${String(
                      code
                    ).trim()}`
                  );
                }
                return { mon_lien_quan_id, loai, bat_buoc: true };
              });
            }

            // Kiểm tra trùng mã
            const existed = await uow.monHocRepository.findByMaMon(ma_mon);
            if (existed) throw new Error(`Mã môn đã tồn tại: ${ma_mon}`);

            const id = await uow.monHocRepository.create({
              ma_mon,
              ten_mon,
              so_tin_chi,
              khoa_id,
              loai_mon: raw.loai_mon ? String(raw.loai_mon) : undefined,
              la_mon_chung:
                typeof raw.la_mon_chung !== "undefined"
                  ? String(raw.la_mon_chung).toLowerCase() === "true"
                  : undefined,
              thu_tu_hoc: raw.thu_tu_hoc ? Number(raw.thu_tu_hoc) : undefined,
              nganh_ids,
              dieu_kien,
            });

            results.push({ row: rowNo, status: "created", key: ma_mon, id });
          } catch (e: any) {
            results.push({
              row: rowNo,
              status: "failed",
              error: e?.message || "Lỗi không xác định",
            });
          }
        })
      )
    );

    const summary = {
      total: rows.length,
      created: results.filter((r) => r.status === "created").length,
      failed: results.filter((r) => r.status === "failed").length,
    };
    return res.json({
      isSuccess: true,
      message: "Imported",
      data: { summary, results },
    });
  } catch (e: any) {
    return res.status(500).json({
      isSuccess: false,
      message: e?.message || "Import thất bại",
    });
  }
};
