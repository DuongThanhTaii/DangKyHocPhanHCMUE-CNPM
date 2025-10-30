import { PrismaClient, lop_hoc_phan } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class LopHocPhanRepository extends BaseRepository<lop_hoc_phan> {
  constructor(prisma: PrismaClient) {
    super(prisma, "lop_hoc_phan");
  }

  async byGiangVien(giang_vien_id: string) {
    return this.model.findMany({
      where: { giang_vien_id },
      orderBy: { created_at: "desc" },
      include: {
        hoc_phan: {
          include: {
            mon_hoc: true
          }
        },
        lich_hoc_dinh_ky: {
          include: {
            phong: true,
          },
        },
      },
    });
  }

  async detail(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        hoc_phan: { include: { mon_hoc: true } },
        giang_vien: { include: { users: true } },
        phong: true,
      },
    });
  }

  async studentsOfLHP(lop_hoc_phan_id: string) {
    const students = await this.prisma.dang_ky_hoc_phan.findMany({
      where: {
        lop_hoc_phan_id,
        trang_thai: "da_dang_ky"
      },
      include: {
        sinh_vien: {
          select: {
            id: true, // ✅ Thêm UUID sinh viên
            ma_so_sinh_vien: true,
            lop: true,
            users: {
              select: {
                ho_ten: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { ngay_dang_ky: "asc" },
    });

    // Map sang DTO với UUID
    return students.map((item: any) => ({
      id: item.sinh_vien.id, // ✅ UUID sinh viên
      mssv: item.sinh_vien.ma_so_sinh_vien,
      hoTen: item.sinh_vien.users.ho_ten,
      lop: item.sinh_vien.lop,
      email: item.sinh_vien.users.email,
    }));
  }

  async documentsOfLHP(lop_hoc_phan_id: string) {
    return this.prisma.tai_lieu.findMany({
      where: { lop_hoc_phan_id },
      orderBy: { created_at: "desc" },
    });
  }

  async createDocument(data: {
    lop_hoc_phan_id: string;
    ten_tai_lieu: string;
    file_path: string;
    file_type?: string | null;
    uploaded_by: string;
  }) {
    return this.prisma.tai_lieu.create({ data });
  }

  async deleteDocument(id: string, lop_hoc_phan_id: string) {
    return this.prisma.tai_lieu.delete({
      where: { id },
    });
  }

  async gradesOfLHP(lop_hoc_phan_id: string) {
    const lhp = await this.model.findUnique({
      where: { id: lop_hoc_phan_id },
      include: { hoc_phan: true },
    });

    if (!lhp) return { lhp: null, rows: [] as any[] };

    const rows = await this.prisma.ket_qua_hoc_phan.findMany({
      where: {
        lop_hoc_phan_id,
        hoc_ky_id: lhp.hoc_phan.id_hoc_ky,
        mon_hoc_id: lhp.hoc_phan.mon_hoc_id,
      },
    });

    return { lhp, rows };
  }

  async upsertGrades(
    lop_hoc_phan_id: string,
    items: { sinh_vien_id: string; diem_so: number }[]
  ) {
    const lhp = await this.model.findUnique({
      where: { id: lop_hoc_phan_id },
      include: { hoc_phan: true },
    });

    if (!lhp) throw new Error("Không tìm thấy lớp học phần");

    const hoc_ky_id = lhp.hoc_phan.id_hoc_ky;
    const mon_hoc_id = lhp.hoc_phan.mon_hoc_id;

    await this.prisma.$transaction(
      items.map(({ sinh_vien_id, diem_so }) => {
        // ✅ Logic tự động set trạng thái
        const trang_thai = diem_so >= 4 ? "dat" : "khong_dat";

        return this.prisma.ket_qua_hoc_phan.upsert({
          where: {
            sinh_vien_id_mon_hoc_id_hoc_ky_id: {
              sinh_vien_id,
              mon_hoc_id,
              hoc_ky_id,
            },
          },
          update: {
            diem_so,
            lop_hoc_phan_id,
            trang_thai, // ✅ Update trạng thái theo điểm
          },
          create: {
            sinh_vien_id,
            mon_hoc_id,
            hoc_ky_id,
            lop_hoc_phan_id,
            diem_so,
            trang_thai, // ✅ Set trạng thái khi tạo mới
          },
        });
      })
    );
  }

  /**
   * Lấy lớp học phần của GV
   */
  async findByGiangVienAndHocKy(gvUserId: string, hocKyId?: string) {
    return this.model.findMany({
      where: {
        giang_vien_id: gvUserId,
        ...(hocKyId && {
          hoc_phan: {
            id_hoc_ky: hocKyId,
          },
        }),
      },
      include: {
        hoc_phan: {
          include: {
            mon_hoc: true,
          },
        },
        lich_hoc_dinh_ky: {
          include: {
            phong: true,
          },
        },
      },
    });
  }

  /**
   * Lấy lớp học phần theo học kỳ (đang mở)
   */
  async findByHocKyForSinhVien(hocKyId: string) {
    return this.model.findMany({
      where: {
        hoc_phan: { id_hoc_ky: hocKyId },
        trang_thai_lop: "dang_mo",
      },
      include: {
        hoc_phan: { include: { mon_hoc: true } },
        giang_vien: { select: { users: { select: { ho_ten: true } } } },
      },
    });
  }

  /**
   * Tìm lớp học phần theo môn học (mã môn hoặc UUID) và học kỳ
   */
  async findByMonHocAndHocKy(mon_hoc_identifier: string, hoc_ky_id: string) {
    // Check if identifier is UUID or mã môn
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mon_hoc_identifier);

    return this.model.findMany({
      where: {
        hoc_phan: {
          ...(isUuid
            ? { mon_hoc_id: mon_hoc_identifier }
            : { mon_hoc: { ma_mon: mon_hoc_identifier } }
          ),
          id_hoc_ky: hoc_ky_id,
        },
        trang_thai_lop: "dang_mo",
      },
      include: {
        hoc_phan: {
          include: {
            mon_hoc: true,
          },
        },
        giang_vien: {
          select: {
            users: {
              select: {
                ho_ten: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Lấy tất cả lớp học phần của học kỳ (đang mở) kèm đầy đủ thông tin
   */
  async findAllByHocKyWithDetails(hoc_ky_id: string) {
    return this.model.findMany({
      where: {
        hoc_phan: {
          id_hoc_ky: hoc_ky_id,
        },
        trang_thai_lop: "dang_mo",
      },
      include: {
        hoc_phan: {
          include: {
            mon_hoc: true,
          },
        },
        giang_vien: {
          select: {
            users: {
              select: {
                ho_ten: true,
              },
            },
          },
        },
        lich_hoc_dinh_ky: {
          include: {
            phong: true,
          },
        },
      },
      orderBy: [
        {
          hoc_phan: {
            mon_hoc: {
              ma_mon: "asc",
            },
          },
        },
        { ma_lop: "asc" },
      ],
    });
  }
}
