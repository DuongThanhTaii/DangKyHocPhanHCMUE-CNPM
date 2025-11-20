import { BaoCaoOverview, BaoCaoTheoKhoa, BaoCaoTheoNganh, BaoCaoTaiGiangVien } from "../entities/BaoCaoThongKe.entity";

export class BaoCaoAnalysisService {
    generateOverviewConclusion(overview: BaoCaoOverview): string {
        const tiLe = overview.getTiLeThucThu();

        if (overview.isThuDuKyVong()) {
            return `Tình hình đăng ký tốt. Đã đạt ${tiLe.toFixed(2)}% kỳ vọng thu học phí.`;
        }

        if (tiLe >= 80) {
            return `Đăng ký khá tốt (${tiLe.toFixed(2)}% kỳ vọng). Cần đẩy mạnh tuyên truyền để đạt mục tiêu.`;
        }

        if (tiLe >= 50) {
            return `Đăng ký trung bình (${tiLe.toFixed(2)}% kỳ vọng). Cần có biện pháp kích thích đăng ký.`;
        }

        return `Đăng ký yếu (${tiLe.toFixed(2)}% kỳ vọng). Cần rà soát lại chính sách và lịch đăng ký.`;
    }

    generateKhoaConclusion(data: BaoCaoTheoKhoa[]): string {
        if (data.length === 0) return "Chưa có dữ liệu đăng ký theo khoa.";

        const max = data.reduce((prev, curr) => (curr.soDangKy > prev.soDangKy ? curr : prev));
        const min = data.reduce((prev, curr) => (curr.soDangKy < prev.soDangKy ? curr : prev));

        return `Khoa "${max.tenKhoa}" có số đăng ký cao nhất (${max.soDangKy}). Khoa "${min.tenKhoa}" thấp nhất (${min.soDangKy}).`;
    }

    generateNganhConclusion(data: BaoCaoTheoNganh[]): string {
        if (data.length === 0) return "Chưa có dữ liệu đăng ký theo ngành.";

        const max = data.reduce((prev, curr) => (curr.soDangKy > prev.soDangKy ? curr : prev));

        return `Ngành "${max.tenNganh}" có số đăng ký cao nhất (${max.soDangKy}).`;
    }

    generateTaiGiangVienConclusion(data: BaoCaoTaiGiangVien[]): string {
        if (data.length === 0) return "Chưa có dữ liệu tải giảng viên.";

        const quaTai = data.filter((g) => g.isQuaTai());
        const max = data.reduce((prev, curr) => (curr.soLop > prev.soLop ? curr : prev));

        if (quaTai.length > 0) {
            return `Có ${quaTai.length} giảng viên bị quá tải (>5 lớp). GV "${max.hoTen}" đang phụ trách ${max.soLop} lớp.`;
        }

        return `Tải giảng viên hợp lý. GV "${max.hoTen}" có tải cao nhất (${max.soLop} lớp).`;
    }
}
