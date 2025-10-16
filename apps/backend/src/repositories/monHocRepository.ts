import { PrismaClient, Prisma } from "@prisma/client";

export type MonHocFilter = {
  q?: string;
  khoa_id?: string;
  loai_mon?: string;
  la_mon_chung?: boolean;
  nganh_id?: string; // lọc theo ngành (join mon_hoc_nganh)
  page?: number;
  pageSize?: number;
};

export class MonHocRepository {
  constructor(private prisma: PrismaClient) {}

  async findPaged(filter: MonHocFilter) {
    const {
      q,
      khoa_id,
      loai_mon,
      la_mon_chung,
      nganh_id,
      page = 1,
      pageSize = 20,
    } = filter;

    const where: Prisma.mon_hocWhereInput = {
      AND: [
        q
          ? {
              OR: [
                { ma_mon: { contains: q, mode: "insensitive" } },
                { ten_mon: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        khoa_id ? { khoa_id } : {},
        loai_mon ? { loai_mon } : {},
        typeof la_mon_chung === "boolean" ? { la_mon_chung } : {},
        nganh_id ? { mon_hoc_nganh: { some: { nganh_id } } } : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.mon_hoc.findMany({
        where,
        orderBy: [{ ten_mon: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          khoa: { select: { id: true, ten_khoa: true } },
          mon_hoc_nganh: {
            select: { nganh_hoc: { select: { id: true, ten_nganh: true } } },
          },
          // KHÔNG include mon_dieu_kien ở list để nhẹ; load ở detail
        },
      }),
      this.prisma.mon_hoc.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prisma.mon_hoc.findUnique({
      where: { id },
      include: {
        khoa: { select: { id: true, ten_khoa: true } },
        mon_hoc_nganh: {
          select: {
            nganh_hoc: { select: { id: true, ten_nganh: true } },
            nganh_id: true,
          },
        },
        // 2 hướng quan hệ của mon_dieu_kien
        mon_dieu_kien_mon_dieu_kien_mon_hoc_idTomon_hoc: {
          select: {
            id: true,
            loai: true,
            bat_buoc: true,
            mon_lien_quan_id: true,
            mon_hoc_mon_dieu_kien_mon_lien_quan_idTomon_hoc: {
              select: { id: true, ma_mon: true, ten_mon: true },
            },
          },
        },
      },
    });
  }

  findByMaMon(ma_mon: string) {
    return this.prisma.mon_hoc.findUnique({ where: { ma_mon } });
  }

  /**
   * Tạo mon_hoc + gán ngành + điều kiện.
   * Chú ý: không include nặng — trả về id, FE/Service load lại detail sau.
   */
  async create(data: {
    ma_mon: string;
    ten_mon: string;
    so_tin_chi: number;
    khoa_id: string;
    loai_mon?: string;
    la_mon_chung?: boolean;
    thu_tu_hoc?: number;
    nganh_ids?: string[];
    dieu_kien?: Array<{
      mon_lien_quan_id: string;
      loai: string;
      bat_buoc?: boolean;
    }>;
  }) {
    const {
      ma_mon,
      ten_mon,
      so_tin_chi,
      khoa_id,
      loai_mon,
      la_mon_chung,
      thu_tu_hoc,
      nganh_ids,
      dieu_kien,
    } = data;

    const created = await this.prisma.$transaction(async (tx) => {
      const mh = await tx.mon_hoc.create({
        data: {
          ma_mon,
          ten_mon,
          so_tin_chi,
          khoa_id,
          loai_mon: loai_mon ?? "chuyen_nganh",
          la_mon_chung: la_mon_chung ?? false,
          thu_tu_hoc: typeof thu_tu_hoc === "number" ? thu_tu_hoc : 1,
        },
        select: { id: true },
      });

      // gán ngành
      if (nganh_ids?.length) {
        await tx.mon_hoc_nganh.createMany({
          data: nganh_ids.map((nganh_id) => ({ mon_hoc_id: mh.id, nganh_id })),
          skipDuplicates: true,
        });
      }

      // điều kiện
      if (dieu_kien?.length) {
        // chặn self-reference
        const validDK = dieu_kien.filter((dk) => dk.mon_lien_quan_id !== mh.id);
        if (validDK.length) {
          await tx.mon_dieu_kien.createMany({
            data: validDK.map((dk) => ({
              mon_hoc_id: mh.id,
              mon_lien_quan_id: dk.mon_lien_quan_id,
              loai: dk.loai,
              bat_buoc: typeof dk.bat_buoc === "boolean" ? dk.bat_buoc : true,
            })),
            skipDuplicates: true,
          });
        }
      }

      return mh.id;
    });

    return created; // trả về id
  }

  /**
   * Cập nhật mon_hoc + (tuỳ chọn) replace danh sách ngành & điều kiện
   */
  async update(
    id: string,
    data: Partial<{
      ma_mon: string;
      ten_mon: string;
      so_tin_chi: number;
      khoa_id: string;
      loai_mon?: string;
      la_mon_chung?: boolean;
      thu_tu_hoc?: number;
      nganh_ids?: string[] | null; // null = không đụng; [] = xoá hết
      dieu_kien?: Array<{
        mon_lien_quan_id: string;
        loai: string;
        bat_buoc?: boolean;
      }> | null;
    }>
  ) {
    await this.prisma.$transaction(async (tx) => {
      const { nganh_ids, dieu_kien, ...patch } = data;

      // cập nhật core fields
      if (Object.keys(patch).length) {
        await tx.mon_hoc.update({
          where: { id },
          data: patch,
        });
      }

      // cập nhật ngành (replace)
      if (nganh_ids) {
        await tx.mon_hoc_nganh.deleteMany({ where: { mon_hoc_id: id } });
        if (nganh_ids.length) {
          await tx.mon_hoc_nganh.createMany({
            data: nganh_ids.map((nganh_id) => ({ mon_hoc_id: id, nganh_id })),
            skipDuplicates: true,
          });
        }
      }

      // cập nhật điều kiện (replace)
      if (dieu_kien) {
        await tx.mon_dieu_kien.deleteMany({ where: { mon_hoc_id: id } });
        if (dieu_kien.length) {
          const validDK = dieu_kien.filter((dk) => dk.mon_lien_quan_id !== id);
          if (validDK.length) {
            await tx.mon_dieu_kien.createMany({
              data: validDK.map((dk) => ({
                mon_hoc_id: id,
                mon_lien_quan_id: dk.mon_lien_quan_id,
                loai: dk.loai,
                bat_buoc: typeof dk.bat_buoc === "boolean" ? dk.bat_buoc : true,
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    });

    return true;
  }

  /**
   * Xoá môn học.
   * Tuỳ hệ quả, có thể chặn nếu đang có hoc_phan phụ thuộc.
   */
  async delete(id: string, opts?: { force?: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      if (!opts?.force) {
        const countHP = await tx.hoc_phan.count({ where: { mon_hoc_id: id } });
        if (countHP > 0) {
          throw new Error(
            "Không thể xoá: Môn học đang được sử dụng trong lớp học phần"
          );
        }
      }
      // Prisma sẽ xoá các bảng con `mon_hoc_nganh`, `mon_dieu_kien` do onDelete: Cascade
      await tx.mon_hoc.delete({ where: { id } });
    });
  }
}
