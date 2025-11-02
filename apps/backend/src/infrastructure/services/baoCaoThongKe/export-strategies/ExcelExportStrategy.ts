import { injectable } from "inversify";
import ExcelJS from "exceljs";
import { IExportStrategy, ExportData, ExportMetadata } from "../../../../application/ports/baoCaoThongKe/services/IExportStrategy";

@injectable()
export class ExcelExportStrategy implements IExportStrategy {
    async export(data: ExportData, metadata: ExportMetadata): Promise<Buffer> {
        const wb = new ExcelJS.Workbook();
        wb.created = new Date();

        // Sheet 1: Tổng quan
        const ws1 = wb.addWorksheet("Tổng quan");
        ws1.addRows([
            ["Chỉ số", "Giá trị"],
            ["SV đã đăng ký (unique)", data.overview.svUnique],
            ["Số bản ghi đăng ký", data.overview.soDangKy],
            ["Số lớp học phần mở", data.overview.soLopHocPhan],
            ["Thực thu (VND)", data.overview.taiChinh.thuc_thu],
            ["Kỳ vọng (VND)", data.overview.taiChinh.ky_vong],
            ["Kết luận", data.overview.ketLuan],
        ]);

        // Sheet 2: ĐK theo khoa
        const ws2 = wb.addWorksheet("ĐK theo khoa");
        ws2.addRow(["Khoa", "Số đăng ký"]);
        data.theoKhoa.data.forEach((x: any) => ws2.addRow([x.ten_khoa, x.so_dang_ky]));
        ws2.addRow([]);
        ws2.addRow(["Kết luận", data.theoKhoa.ketLuan]);

        // Sheet 3: ĐK theo ngành
        const ws3 = wb.addWorksheet("ĐK theo ngành");
        ws3.addRow(["Ngành", "Số đăng ký"]);
        data.theoNganh.data.forEach((x: any) => ws3.addRow([x.ten_nganh, x.so_dang_ky]));
        ws3.addRow([]);
        ws3.addRow(["Kết luận", data.theoNganh.ketLuan]);

        // Sheet 4: Tải giảng viên
        const ws4 = wb.addWorksheet("Tải giảng viên");
        ws4.addRow(["Giảng viên", "Số lớp"]);
        data.taiGiangVien.data.forEach((x: any) => ws4.addRow([x.ho_ten, x.so_lop]));
        ws4.addRow([]);
        ws4.addRow(["Kết luận", data.taiGiangVien.ketLuan]);

        const buffer = await wb.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
