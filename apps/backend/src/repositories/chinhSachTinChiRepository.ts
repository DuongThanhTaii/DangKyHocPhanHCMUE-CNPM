import { PrismaClient, chinh_sach_tin_chi } from "@prisma/client";
import { BaseRepository } from "./baseRepository";

export class ChinhSachTinChiRepository extends BaseRepository<chinh_sach_tin_chi> {
  constructor(prisma: PrismaClient) {
    super(prisma, "chinh_sach_tin_chi");
  }

  /**
   * Lấy tất cả chính sách tín chỉ kèm thông tin liên quan
   */
  async findAllWithRelations() {
    return this.model.findMany({
      include: {
        hoc_ky: {
          select: {
            ten_hoc_ky: true,
            ma_hoc_ky: true,
          },
        },
        khoa: {
          select: {
            ten_khoa: true,
          },
        },
        nganh_hoc: {
          select: {
            ten_nganh: true,
          },
        },
      },
      orderBy: {
        ngay_hieu_luc: "desc",
      },
    });
  }

  /**
   * Tìm chính sách tín chỉ candidates (cho tính học phí)
   */
  async findCandidates(params: {
    nganh_id?: string | null;
    khoa_id: string;
    hoc_ky_id: string;
  }) {
    const { nganh_id, khoa_id, hoc_ky_id } = params;
    return this.model.findMany({
      where: {
        OR: [
          { nganh_id: nganh_id ?? undefined },
          { khoa_id },
          { hoc_ky_id },
          { nganh_id: null, khoa_id: null, hoc_ky_id: null },
        ],
      },
      orderBy: { ngay_hieu_luc: "desc" },
    });
  }

  /**
   * Tạo chính sách tín chỉ mới
   */
  async createChinhSach(data: {
    hoc_ky_id: string;
    khoa_id?: string | null;
    nganh_id?: string | null;
    phi_moi_tin_chi: number;
    ngay_hieu_luc: Date;
    ngay_het_hieu_luc?: Date | null;
  }) {
    return this.model.create({
      data,
      include: {
        hoc_ky: {
          select: {
            ten_hoc_ky: true,
            ma_hoc_ky: true,
            ngay_bat_dau: true,
            ngay_ket_thuc: true,
          },
        },
        khoa: {
          select: {
            ten_khoa: true,
          },
        },
        nganh_hoc: {
          select: {
            ten_nganh: true,
          },
        },
      },
    });
  }

  /**
   * Update phí tín chỉ
   */
  async updatePhiTinChi(id: string, phi_moi_tin_chi: number) {
    return this.model.update({
      where: { id },
      data: { phi_moi_tin_chi },
      include: {
        hoc_ky: {
          select: {
            ten_hoc_ky: true,
            ma_hoc_ky: true,
            ngay_bat_dau: true,
            ngay_ket_thuc: true,
          },
        },
        khoa: {
          select: {
            ten_khoa: true,
          },
        },
        nganh_hoc: {
          select: {
            ten_nganh: true,
          },
        },
      },
    });
  }

  /**
   * Check chính sách đã tồn tại cho khoa/ngành trong học kỳ
   */
  async checkExists(params: {
    hoc_ky_id: string;
    khoa_id?: string | null;
    nganh_id?: string | null;
  }) {
    return this.model.findFirst({
      where: {
        hoc_ky_id: params.hoc_ky_id,
        khoa_id: params.khoa_id || null,
        nganh_id: params.nganh_id || null,
      },
    });
  }

  /**
   * Lấy danh sách ngành đã có chính sách trong học kỳ (theo khoa)
   */
  async getNganhIdsWithPolicy(hoc_ky_id: string, khoa_id: string): Promise<string[]> {
    const records = await this.model.findMany({
      where: {
        hoc_ky_id,
        khoa_id,
        nganh_id: { not: null },
      },
      select: {
        nganh_id: true,
      },
    });

    return records
      .map((r: any) => r.nganh_id)
      .filter((id: any): id is string => id !== null);
  }
}
