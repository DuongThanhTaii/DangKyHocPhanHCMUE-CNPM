import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import {
    ITaiLieuRepository,
    TaiLieuData,
    LopDaDangKyWithTaiLieuData,
} from "../../../application/ports/sinhvien/ITaiLieuRepository";

@injectable()
export class PrismaTaiLieuRepository implements ITaiLieuRepository {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async findByLopHocPhanId(lop_hoc_phan_id: string): Promise<TaiLieuData[]> {
        const records = await this.prisma.tai_lieu.findMany({
            where: { lop_hoc_phan_id },
            include: {
                users: {
                    select: { ho_ten: true }
                }
            },
            orderBy: { created_at: "desc" },
        });

        return records.map(record => ({
            id: record.id,
            lop_hoc_phan_id: record.lop_hoc_phan_id,
            ten_tai_lieu: record.ten_tai_lieu,
            file_path: record.file_path,
            file_type: record.file_type,
            uploaded_by: record.uploaded_by,
            created_at: record.created_at || new Date(),
            uploader_name: record.users?.ho_ten || "Giảng viên"
        }));
    }

    async findByMultipleLopHocPhanIds(lop_hoc_phan_ids: string[]): Promise<TaiLieuData[]> {
        const records = await this.prisma.tai_lieu.findMany({
            where: {
                lop_hoc_phan_id: { in: lop_hoc_phan_ids }
            },
            include: {
                users: {
                    select: { ho_ten: true }
                }
            },
            orderBy: { created_at: "desc" },
        });

        return records.map(record => ({
            id: record.id,
            lop_hoc_phan_id: record.lop_hoc_phan_id,
            ten_tai_lieu: record.ten_tai_lieu,
            file_path: record.file_path,
            file_type: record.file_type,
            uploaded_by: record.uploaded_by,
            created_at: record.created_at || new Date(),
            uploader_name: record.users?.ho_ten || "Giảng viên"
        }));
    }

    async getLopDaDangKyWithTaiLieu(sinh_vien_id: string, hoc_ky_id: string): Promise<LopDaDangKyWithTaiLieuData[]> {
        // Lấy danh sách đăng ký
        const dangKys = await this.prisma.dang_ky_hoc_phan.findMany({
            where: {
                sinh_vien_id,
                lop_hoc_phan: {
                    hoc_phan: {
                        hoc_ky: {
                            id: hoc_ky_id
                        }
                    }
                }
            },
            include: {
                lop_hoc_phan: {
                    include: {
                        hoc_phan: {
                            include: {
                                mon_hoc: true
                            }
                        },
                        giang_vien: {
                            include: {
                                users: {
                                    select: { ho_ten: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (dangKys.length === 0) {
            return [];
        }

        // Lấy danh sách ID lớp học phần
        const lopHocPhanIds = dangKys.map(dk => dk.lop_hoc_phan_id);

        // Lấy tài liệu
        const taiLieuRecords = await this.findByMultipleLopHocPhanIds(lopHocPhanIds);

        // Group tài liệu theo lop_hoc_phan_id
        const taiLieuMap = new Map<string, TaiLieuData[]>();
        taiLieuRecords.forEach(tl => {
            if (!taiLieuMap.has(tl.lop_hoc_phan_id)) {
                taiLieuMap.set(tl.lop_hoc_phan_id, []);
            }
            taiLieuMap.get(tl.lop_hoc_phan_id)!.push(tl);
        });

        // Map data
        return dangKys.map(dk => {
            const lhp = (dk as any).lop_hoc_phan;
            const monHoc = lhp.hoc_phan.mon_hoc;

            return {
                lopHocPhanId: lhp.id,
                maLop: lhp.ma_lop,
                maMon: monHoc.ma_mon,
                tenMon: monHoc.ten_mon,
                soTinChi: monHoc.so_tin_chi,
                giangVien: lhp.giang_vien?.users?.ho_ten || "Chưa phân công",
                trangThaiDangKy: dk.trang_thai || "da_dang_ky",
                ngayDangKy: dk.ngay_dang_ky || new Date(),
                taiLieu: taiLieuMap.get(lhp.id) || []
            };
        });
    }

    async checkSinhVienDangKyLop(sinh_vien_id: string, lop_hoc_phan_id: string): Promise<boolean> {
        const dangKy = await this.prisma.dang_ky_hoc_phan.findUnique({
            where: {
                sinh_vien_id_lop_hoc_phan_id: {
                    sinh_vien_id,
                    lop_hoc_phan_id
                }
            }
        });

        return dangKy !== null && dangKy.trang_thai !== "da_huy";
    }
}
