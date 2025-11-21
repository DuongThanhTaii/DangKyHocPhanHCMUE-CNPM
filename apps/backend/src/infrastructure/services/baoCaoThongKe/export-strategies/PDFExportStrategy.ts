import { injectable } from "inversify";
import { IExportStrategy, ExportData, ExportMetadata } from "../../../../application/ports/baoCaoThongKe/services/IExportStrategy";

@injectable()
export class PDFExportStrategy implements IExportStrategy {
    async export(data: ExportData, metadata: ExportMetadata): Promise<Buffer> {
        const puppeteer = (await import("puppeteer")).default;
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const chartImgs = (metadata.charts || [])
            .map((c) => `<h4>${c.name}</h4><img style="max-width:100%" src="${c.dataUrl}" />`)
            .join("");

        const html = `
      <html><head><meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size:12px; }
          h1, h2 { margin: 0 0 8px; }
          table { border-collapse: collapse; width: 100%; margin: 8px 0; }
          td, th { border: 1px solid #ccc; padding: 6px; }
          .muted { color:#666; }
        </style>
      </head><body>
        <h1>BÁO CÁO THỐNG KÊ HỌC KỲ</h1>
        <p class="muted">Kỳ: ${metadata.hocKyId}</p>

        <h2>I. Tổng quan</h2>
        <table>
          <tr><th>Chỉ số</th><th>Giá trị</th></tr>
          <tr><td>SV đã đăng ký</td><td>${data.overview.svUnique}</td></tr>
          <tr><td>Số bản ghi đăng ký</td><td>${data.overview.soDangKy}</td></tr>
          <tr><td>Số lớp học phần mở</td><td>${data.overview.soLopHocPhan}</td></tr>
          <tr><td>Thực thu</td><td>${data.overview.taiChinh.thuc_thu.toLocaleString("vi-VN")} VND</td></tr>
          <tr><td>Kỳ vọng</td><td>${data.overview.taiChinh.ky_vong.toLocaleString("vi-VN")} VND</td></tr>
        </table>
        <p><b>Kết luận:</b> ${data.overview.ketLuan}</p>

        <h2>II. Đăng ký theo khoa</h2>
        <table>
          <tr><th>Khoa</th><th>Số đăng ký</th></tr>
          ${data.theoKhoa.data.map((x: any) => `<tr><td>${x.ten_khoa}</td><td>${x.so_dang_ky}</td></tr>`).join("")}
        </table>
        <p><b>Kết luận:</b> ${data.theoKhoa.ketLuan}</p>

        <h2>III. Đăng ký theo ngành</h2>
        <table>
          <tr><th>Ngành</th><th>Số đăng ký</th></tr>
          ${data.theoNganh.data.map((x: any) => `<tr><td>${x.ten_nganh}</td><td>${x.so_dang_ky}</td></tr>`).join("")}
        </table>
        <p><b>Kết luận:</b> ${data.theoNganh.ketLuan}</p>

        <h2>IV. Tải giảng viên</h2>
        <table>
          <tr><th>Giảng viên</th><th>Số lớp</th></tr>
          ${data.taiGiangVien.data.map((x: any) => `<tr><td>${x.ho_ten}</td><td>${x.so_lop}</td></tr>`).join("")}
        </table>
        <p><b>Kết luận:</b> ${data.taiGiangVien.ketLuan}</p>

      </body></html>
    `;

        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({ format: "A4", printBackground: true });
        await browser.close();

        return Buffer.from(pdf);
    }
}
