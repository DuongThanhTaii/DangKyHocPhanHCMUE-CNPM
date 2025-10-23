import { prisma } from "../db/prisma";

export const lopHocPhanRepository = {
  byGiangVien: (giang_vien_id: string) =>
    prisma.lop_hoc_phan.findMany({
      where: { giang_vien_id },
      orderBy: { created_at: "desc" },
      include: {
        hoc_phan: { include: { mon_hoc: true } },
        lich_hoc_dinh_ky: true,
      },
    }),

  detail: (id: string) =>
    prisma.lop_hoc_phan.findUnique({
      where: { id },
      include: {
        hoc_phan: { include: { mon_hoc: true } },
        giang_vien: { include: { users: true } },
        phong: true,
      },
    }),

  studentsOfLHP: (lop_hoc_phan_id: string) =>
    prisma.dang_ky_hoc_phan.findMany({
      where: { lop_hoc_phan_id },
      include: {
        sinh_vien: {
          include: {
            users: true,
            nganh_hoc: true,
            khoa: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: "asc" },
    }),

  documentsOfLHP: (lop_hoc_phan_id: string) =>
    prisma.tai_lieu.findMany({
      where: { lop_hoc_phan_id },
      orderBy: { created_at: "desc" },
    }),

  createDocument: (data: {
    lop_hoc_phan_id: string;
    ten_tai_lieu: string;
    file_path: string;
    file_type?: string | null;
    uploaded_by: string;
  }) => prisma.tai_lieu.create({ data }),

  deleteDocument: (id: string, lop_hoc_phan_id: string) =>
    prisma.tai_lieu.delete({
      where: { id },
    }),

  // điểm: đọc điểm hiện có
  gradesOfLHP: async (lop_hoc_phan_id: string) => {
    const lhp = await prisma.lop_hoc_phan.findUnique({
      where: { id: lop_hoc_phan_id },
      include: { hoc_phan: true },
    });
    if (!lhp) return { lhp: null, rows: [] as any[] };

    const rows = await prisma.ket_qua_hoc_phan.findMany({
      where: {
        lop_hoc_phan_id,
        hoc_ky_id: lhp.hoc_phan.id_hoc_ky,
        mon_hoc_id: lhp.hoc_phan.mon_hoc_id,
      },
    });
    return { lhp, rows };
  },

  // điểm: upsert theo unique (sinh_vien_id, mon_hoc_id, hoc_ky_id)
  upsertGrades: async (
    lop_hoc_phan_id: string,
    items: { sinh_vien_id: string; diem_so: number }[]
  ) => {
    const lhp = await prisma.lop_hoc_phan.findUnique({
      where: { id: lop_hoc_phan_id },
      include: { hoc_phan: true },
    });
    if (!lhp) throw new Error("Không tìm thấy lớp học phần");
    const hoc_ky_id = lhp.hoc_phan.id_hoc_ky;
    const mon_hoc_id = lhp.hoc_phan.mon_hoc_id;

    await prisma.$transaction(
      items.map(({ sinh_vien_id, diem_so }) =>
        prisma.ket_qua_hoc_phan.upsert({
          where: {
            sinh_vien_id_mon_hoc_id_hoc_ky_id: {
              sinh_vien_id,
              mon_hoc_id,
              hoc_ky_id,
            },
          },
          update: { diem_so, lop_hoc_phan_id },
          create: {
            sinh_vien_id,
            mon_hoc_id,
            hoc_ky_id,
            lop_hoc_phan_id,
            diem_so,
            trang_thai: "da_nhap",
          },
        })
      )
    );
  },
};
