import { Prisma, chinh_sach_tin_chi } from "@prisma/client";
import { prisma } from "../db/prisma";
import { DangKyHocPhanRepository } from "../repositories/dangKyHocPhanRepository";
import { MienGiamHocPhiRepository } from "../repositories/mienGiamHocPhiRepository";
import { ChinhSachTinChiRepository } from "../repositories/chinhSachTinChiRepository";
import { HocPhiRepository } from "../repositories/hocPhiRepository";

const dkhpRepo = new DangKyHocPhanRepository(prisma);

function isInRange(d: Date, start?: Date | null, end?: Date | null) {
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export async function getEffectivePolicyForStudent(
  sinh_vien_id: string,
  hoc_ky_id: string,
  onDate: Date = new Date()
): Promise<chinh_sach_tin_chi | null> {
  const sv = await prisma.sinh_vien.findUniqueOrThrow({
    where: { id: sinh_vien_id },
    select: { khoa_id: true, nganh_id: true },
  });

  const candidates = await ChinhSachTinChiRepository.findCandidates({
    nganh_id: sv.nganh_id ?? null,
    khoa_id: sv.khoa_id,
    hoc_ky_id,
  });

  const inEffect = candidates.filter((p) =>
    isInRange(onDate, p.ngay_hieu_luc ?? null, p.ngay_het_hieu_luc ?? null)
  );

  const byNganh = sv.nganh_id
    ? inEffect.find((p) => p.nganh_id === sv.nganh_id)
    : null;
  if (byNganh) return byNganh;
  const byKhoa = inEffect.find((p) => p.khoa_id === sv.khoa_id);
  if (byKhoa) return byKhoa;
  const byHocKy = inEffect.find((p) => p.hoc_ky_id === hoc_ky_id);
  if (byHocKy) return byHocKy;
  return (
    inEffect.find((p) => !p.khoa_id && !p.nganh_id && !p.hoc_ky_id) ?? null
  );
}

export async function getStudentDiscount(
  sinh_vien_id: string,
  hoc_ky_id: string
) {
  const mg = await MienGiamHocPhiRepository.findFirstBySVHK(
    sinh_vien_id,
    hoc_ky_id
  );
  if (!mg) return { mien_phi: false, ti_le_giam: new Prisma.Decimal(0) };
  const ti_le = mg.mien_phi
    ? new Prisma.Decimal(100)
    : mg.ti_le_giam ?? new Prisma.Decimal(0);
  return { mien_phi: !!mg.mien_phi, ti_le_giam: ti_le };
}

export async function computeTuitionForStudent(
  sinh_vien_id: string,
  hoc_ky_id: string
) {
  const [policy, discount, regs] = await Promise.all([
    getEffectivePolicyForStudent(sinh_vien_id, hoc_ky_id),
    getStudentDiscount(sinh_vien_id, hoc_ky_id),
    dkhpRepo.findBySinhVienInHocKyWithTinChi(sinh_vien_id, hoc_ky_id),
  ]);

  const basePerCredit = policy
    ? new Prisma.Decimal(policy.phi_moi_tin_chi)
    : new Prisma.Decimal(0);
  const effectivePerCredit = discount.mien_phi
    ? new Prisma.Decimal(0)
    : basePerCredit.mul(
        new Prisma.Decimal(1).sub(discount.ti_le_giam.div(100))
      );

  return prisma.$transaction(async (trx) => {
    // Upsert hoc_phi
    const hp = await trx.hoc_phi.upsert({
      where: { sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id } },
      update: { chinh_sach_id: policy?.id ?? null, ngay_tinh_toan: new Date() },
      create: {
        sinh_vien_id,
        hoc_ky_id,
        tong_hoc_phi: new Prisma.Decimal(0),
        trang_thai_thanh_toan: "chua_thanh_toan",
        chinh_sach_id: policy?.id ?? null,
      },
    });

    // Xoá chi tiết cũ
    await trx.chi_tiet_hoc_phi.deleteMany({ where: { hoc_phi_id: hp.id } });

    // Ghi chi tiết + cộng tổng
    let tong = new Prisma.Decimal(0);
    for (const r of regs) {
      const soTinChi = r.lop_hoc_phan.hoc_phan.mon_hoc.so_tin_chi || 0;
      const tinchi = new Prisma.Decimal(soTinChi);
      const thanhTien = tinchi.mul(effectivePerCredit);
      tong = tong.add(thanhTien);

      await trx.chi_tiet_hoc_phi.create({
        data: {
          hoc_phi_id: hp.id,
          lop_hoc_phan_id: r.lop_hoc_phan_id,
          so_tin_chi: soTinChi,
          phi_tin_chi: effectivePerCredit,
          thanh_tien: thanhTien,
        },
      });
    }

    // Cập nhật tổng
    const updated = await trx.hoc_phi.update({
      where: { id: hp.id },
      data: { tong_hoc_phi: tong, ngay_tinh_toan: new Date() },
      include: {
        chi_tiet_hoc_phi: true,
        chinh_sach_tin_chi: true,
        hoc_ky: true,
      },
    });

    return {
      hoc_phi: updated,
      don_gia_ap_dung: effectivePerCredit,
      giam_tru: discount,
      policy: policy ?? null,
    };
  });
}
