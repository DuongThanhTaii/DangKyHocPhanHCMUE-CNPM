import { UnitOfWork } from "../repositories/unitOfWork";
import { ServiceResult, ServiceResultBuilder } from "../types/serviceResult";
import { Prisma } from "@prisma/client";

export class HocPhiService {
    private uow = UnitOfWork.getInstance();

    /**
     * Lấy chính sách tín chỉ hiệu lực cho sinh viên
     */
    private async getEffectivePolicy(
        sinh_vien_id: string,
        hoc_ky_id: string,
        onDate: Date = new Date()
    ) {
        const sv = await this.uow.client.sinh_vien.findUniqueOrThrow({
            where: { id: sinh_vien_id },
            select: { khoa_id: true, nganh_id: true },
        });

        // ✅ Dùng repository mới
        const candidates = await this.uow.chinhSachTinChiRepository.findCandidates({
            nganh_id: sv.nganh_id,
            khoa_id: sv.khoa_id,
            hoc_ky_id,
        });

        const inEffect = candidates.filter((p:any) => {
            if (p.ngay_hieu_luc && onDate < p.ngay_hieu_luc) return false;
            if (p.ngay_het_hieu_luc && onDate > p.ngay_het_hieu_luc) return false;
            return true;
        });

        // Priority: Ngành > Khoa > Học kỳ > Mặc định
        const byNganh = sv.nganh_id ? inEffect.find((p:any) => p.nganh_id === sv.nganh_id) : null;
        if (byNganh) return byNganh;

        const byKhoa = inEffect.find((p:any) => p.khoa_id === sv.khoa_id);
        if (byKhoa) return byKhoa;

        const byHocKy = inEffect.find((p:any) => p.hoc_ky_id === hoc_ky_id);
        if (byHocKy) return byHocKy;

        return inEffect.find((p:any) => !p.khoa_id && !p.nganh_id && !p.hoc_ky_id) ?? null;
    }

    /**
     * Lấy thông tin miễn giảm của sinh viên
     */
    private async getDiscount(sinh_vien_id: string, hoc_ky_id: string) {
        const mg = await this.uow.client.mien_giam_hoc_phi.findFirst({
            where: { sinh_vien_id, hoc_ky_id },
        });

        if (!mg) return { mien_phi: false, ti_le_giam: new Prisma.Decimal(0) };

        const ti_le = mg.mien_phi ? new Prisma.Decimal(100) : mg.ti_le_giam ?? new Prisma.Decimal(0);
        return { mien_phi: !!mg.mien_phi, ti_le_giam: ti_le };
    }

    /**
     * Tính học phí cho sinh viên
     */
    async computeTuition(sinh_vien_id: string, hoc_ky_id: string): Promise<ServiceResult<any>> {
        try {
            // Lấy policy, discount, và danh sách đăng ký
            const [policy, discount, regs] = await Promise.all([
                this.getEffectivePolicy(sinh_vien_id, hoc_ky_id),
                this.getDiscount(sinh_vien_id, hoc_ky_id),
                this.uow.dangKyHocPhanRepository.findBySinhVienInHocKyWithTinChi(sinh_vien_id, hoc_ky_id),
            ]);

            // Tính đơn giá áp dụng
            const basePerCredit = policy ? new Prisma.Decimal(policy.phi_moi_tin_chi) : new Prisma.Decimal(0);
            const effectivePerCredit = discount.mien_phi
                ? new Prisma.Decimal(0)
                : basePerCredit.mul(new Prisma.Decimal(1).sub(discount.ti_le_giam.div(100)));

            // Transaction tính học phí
            const result = await this.uow.client.$transaction(async (trx) => {
                // Upsert học phí
                const hp = await trx.hoc_phi.upsert({
                    where: { sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id } },
                    update: {
                        chinh_sach_id: policy?.id ?? null,
                        ngay_tinh_toan: new Date(),
                    },
                    create: {
                        sinh_vien_id,
                        hoc_ky_id,
                        tong_hoc_phi: new Prisma.Decimal(0),
                        trang_thai_thanh_toan: "chua_thanh_toan",
                        chinh_sach_id: policy?.id ?? null,
                    },
                });

                // Xóa chi tiết cũ
                await trx.chi_tiet_hoc_phi.deleteMany({ where: { hoc_phi_id: hp.id } });

                // Tính và lưu chi tiết
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
                return await trx.hoc_phi.update({
                    where: { id: hp.id },
                    data: { tong_hoc_phi: tong, ngay_tinh_toan: new Date() },
                    include: {
                        chi_tiet_hoc_phi: {
                            include: {
                                lop_hoc_phan: {
                                    include: {
                                        hoc_phan: {
                                            include: {
                                                mon_hoc: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        chinh_sach_tin_chi: true,
                        hoc_ky: true,
                    },
                });
            });

            return ServiceResultBuilder.success("Tính học phí thành công", {
                hocPhi: result,
                donGiaApDung: effectivePerCredit.toNumber(),
                giamTru: discount,
                chinhSach: policy,
            });
        } catch (error) {
            console.error("Error computing tuition:", error);
            return ServiceResultBuilder.failure("Lỗi khi tính học phí", "INTERNAL_ERROR");
        }
    }

    /**
     * Lấy thông tin học phí của sinh viên
     */
    async getHocPhi(sinh_vien_id: string, hoc_ky_id: string): Promise<ServiceResult<any>> {
        try {
            const hocPhi = await this.uow.client.hoc_phi.findUnique({
                where: { sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id } },
                include: {
                    chi_tiet_hoc_phi: {
                        include: {
                            lop_hoc_phan: {
                                include: {
                                    hoc_phan: {
                                        include: {
                                            mon_hoc: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    chinh_sach_tin_chi: true,
                    hoc_ky: true,
                },
            });

            if (!hocPhi) {
                // Tự động tính nếu chưa có
                return this.computeTuition(sinh_vien_id, hoc_ky_id);
            }

            return ServiceResultBuilder.success("Lấy thông tin học phí thành công", hocPhi);
        } catch (error) {
            console.error("Error getting hoc phi:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy thông tin học phí", "INTERNAL_ERROR");
        }
    }
}
