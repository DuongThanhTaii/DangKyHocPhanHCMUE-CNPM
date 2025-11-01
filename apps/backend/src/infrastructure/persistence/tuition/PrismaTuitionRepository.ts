import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma/client";
import {
    ITuitionRepository,
    TuitionData,
    TuitionDetailData,
    TuitionDetailItemData,
} from "../../../application/ports/tuition/ITuitionRepository";
import { TuitionDetailDTO } from "../../../application/dtos/tuition/TuitionDetailDTO";

@injectable()
export class PrismaTuitionRepository implements ITuitionRepository {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async findBySinhVienAndHocKy(sinh_vien_id: string, hoc_ky_id: string): Promise<TuitionData | null> {
        const record = await this.prisma.hoc_phi.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
        });

        if (!record) return null;

        return {
            id: record.id,
            sinh_vien_id: record.sinh_vien_id,
            hoc_ky_id: record.hoc_ky_id,
            tong_hoc_phi: parseFloat(record.tong_hoc_phi?.toString() || "0"),
            trang_thai_thanh_toan: record.trang_thai_thanh_toan || "chua_thanh_toan",
            chinh_sach_id: record.chinh_sach_id || "",
        };
    }

    async saveTuition(data: {
        sinh_vien_id: string;
        hoc_ky_id: string;
        tong_hoc_phi: number;
        chinh_sach_id: string;
        details: TuitionDetailData[];
    }): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            // Create hoc_phi
            const hocPhi = await tx.hoc_phi.create({
                data: {
                    sinh_vien_id: data.sinh_vien_id,
                    hoc_ky_id: data.hoc_ky_id,
                    tong_hoc_phi: new Prisma.Decimal(data.tong_hoc_phi),
                    trang_thai_thanh_toan: "chua_thanh_toan",
                    chinh_sach_id: data.chinh_sach_id,
                    ngay_tinh_toan: new Date(),
                },
            });

            // Create chi_tiet_hoc_phi
            for (const detail of data.details) {
                await tx.chi_tiet_hoc_phi.create({
                    data: {
                        hoc_phi_id: hocPhi.id,
                        lop_hoc_phan_id: detail.lop_hoc_phan_id,
                        so_tin_chi: detail.so_tin_chi,
                        phi_tin_chi: new Prisma.Decimal(detail.phi_tin_chi),
                        thanh_tien: new Prisma.Decimal(detail.thanh_tien),
                    },
                });
            }
        });
    }

    async updateTuition(data: {
        sinh_vien_id: string;
        hoc_ky_id: string;
        tong_hoc_phi: number;
        chinh_sach_id: string;
        details: TuitionDetailData[];
    }): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            // Get existing hoc_phi
            const existing = await tx.hoc_phi.findUnique({
                where: {
                    sinh_vien_id_hoc_ky_id: {
                        sinh_vien_id: data.sinh_vien_id,
                        hoc_ky_id: data.hoc_ky_id,
                    },
                },
            });

            if (!existing) {
                throw new Error("Học phí không tồn tại");
            }

            // Delete old details
            await tx.chi_tiet_hoc_phi.deleteMany({
                where: { hoc_phi_id: existing.id },
            });

            // Update hoc_phi
            await tx.hoc_phi.update({
                where: { id: existing.id },
                data: {
                    tong_hoc_phi: new Prisma.Decimal(data.tong_hoc_phi),
                    chinh_sach_id: data.chinh_sach_id,
                    ngay_tinh_toan: new Date(),
                },
            });

            // Create new details
            for (const detail of data.details) {
                await tx.chi_tiet_hoc_phi.create({
                    data: {
                        hoc_phi_id: existing.id,
                        lop_hoc_phan_id: detail.lop_hoc_phan_id,
                        so_tin_chi: detail.so_tin_chi,
                        phi_tin_chi: new Prisma.Decimal(detail.phi_tin_chi),
                        thanh_tien: new Prisma.Decimal(detail.thanh_tien),
                    },
                });
            }
        });
    }

    async getChiTietHocPhi(sinh_vien_id: string, hoc_ky_id: string): Promise<TuitionDetailDTO | null> {
        // ✅ Step 1: Kiểm tra học phí đã tồn tại chưa
        const hocPhi = await this.prisma.hoc_phi.findUnique({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
            include: {
                chinh_sach_tin_chi: true,
            },
        });

        // ❌ Nếu chưa có học phí → return null
        if (!hocPhi) {
            return null;
        }

        // ✅ Step 2: Lấy danh sách lớp học phần đã đăng ký
        const danhSachLopHocPhan = await this.prisma.lop_hoc_phan.findMany({
            where: {
                hoc_phan: {
                    id_hoc_ky: hoc_ky_id,
                },
                dang_ky_hoc_phan: {
                    some: {
                        sinh_vien_id,
                        trang_thai: "da_dang_ky",
                    },
                },
            },
            include: {
                hoc_phan: {
                    include: {
                        mon_hoc: true,
                    },
                },
            },
        });

        // ✅ Step 3: Lấy chính sách học phí
        let chinhSach = hocPhi.chinh_sach_tin_chi;
        if (!chinhSach) {
            chinhSach = await this.prisma.chinh_sach_tin_chi.findFirst({
                where: { hoc_ky_id },
                orderBy: { ngay_hieu_luc: "desc" },
            });
        }
        if (!chinhSach) {
            chinhSach = await this.prisma.chinh_sach_tin_chi.findFirst({
                orderBy: { ngay_hieu_luc: "desc" },
            });
        }
        const donGiaTinChi = chinhSach ? Number(chinhSach.phi_moi_tin_chi) : 0;

        // ✅ Step 4: Chi tiết từng môn
        const chiTiet = danhSachLopHocPhan.map((lhp) => {
            const monHoc = lhp.hoc_phan.mon_hoc;
            const soTinChi = monHoc.so_tin_chi;
            return {
                maMon: monHoc.ma_mon,
                tenMon: monHoc.ten_mon,
                maLop: lhp.ma_lop,
                soTinChi,
                donGia: donGiaTinChi,
                thanhTien: soTinChi * donGiaTinChi,
            };
        });

        const soTinChiDangKy = chiTiet.reduce((sum, item) => sum + item.soTinChi, 0);
        const tongHocPhi = chiTiet.reduce((sum, item) => sum + item.thanhTien, 0);

        return {
            sinhVienId: sinh_vien_id,
            hocKyId: hoc_ky_id,
            tongHocPhi,
            soTinChiDangKy,
            donGiaTinChi,
            chinhSach: chinhSach
                ? {
                    tenChinhSach: chinhSach.id,
                    ngayHieuLuc: chinhSach.ngay_hieu_luc?.toISOString() ?? "",
                    ngayHetHieuLuc: chinhSach.ngay_het_hieu_luc?.toISOString() ?? "",
                }
                : {
                    tenChinhSach: "",
                    ngayHieuLuc: "",
                    ngayHetHieuLuc: "",
                },
            chiTiet,
            trangThaiThanhToan: hocPhi.trang_thai_thanh_toan || "chua_thanh_toan",
        };
    }

    async updatePaymentStatus(sinh_vien_id: string, hoc_ky_id: string): Promise<void> {
        await this.prisma.hoc_phi.update({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
            data: {
                trang_thai_thanh_toan: "da_thanh_toan",
                ngay_thanh_toan: new Date(),
            },
        });
    }

    async updateTongHocPhi(sinh_vien_id: string, hoc_ky_id: string, tong_hoc_phi: number): Promise<void> {
        await this.prisma.hoc_phi.update({
            where: {
                sinh_vien_id_hoc_ky_id: { sinh_vien_id, hoc_ky_id },
            },
            data: {
                tong_hoc_phi: new Prisma.Decimal(tong_hoc_phi),
                ngay_tinh_toan: new Date(),
            },
        });
    }
}
