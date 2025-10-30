import { Router } from "express";
import { z } from "zod";
import ExcelJS from "exceljs";
import { BaoCaoServices } from "../../services/baoCaoServices";

const r = Router();

const filterSchema = z.object({
  hoc_ky_id: z.string().uuid(),
  khoa_id: z.string().uuid().optional(),
  nganh_id: z.string().uuid().optional(),
});

// ---- APIs JSON ----
r.get("/overview", async (req, res) => {
  try {
    const q = filterSchema.parse(req.query);
    const data = await BaoCaoServices.overview(q);
    res.json({ isSuccess: true, message: "OK", data });
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

r.get("/dk-theo-khoa", async (req, res) => {
  try {
    const q = z.object({ hoc_ky_id: z.string().uuid() }).parse(req.query);
    const data = await BaoCaoServices.dkTheoKhoa(q.hoc_ky_id);
    res.json({ isSuccess: true, message: "OK", data });
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

r.get("/dk-theo-nganh", async (req, res) => {
  try {
    const q = z
      .object({
        hoc_ky_id: z.string().uuid(),
        khoa_id: z.string().uuid().optional(),
      })
      .parse(req.query);
    const data = await BaoCaoServices.dkTheoNganh(q.hoc_ky_id, q.khoa_id);
    res.json({ isSuccess: true, message: "OK", data });
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

r.get("/tai-giang-vien", async (req, res) => {
  try {
    const q = z
      .object({
        hoc_ky_id: z.string().uuid(),
        khoa_id: z.string().uuid().optional(),
      })
      .parse(req.query);
    const data = await BaoCaoServices.taiGiangVien(q.hoc_ky_id, q.khoa_id);
    res.json({ isSuccess: true, message: "OK", data });
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

// ---- EXPORT EXCEL ----
r.get("/export/excel", async (req, res) => {
  try {
    const q = filterSchema.parse(req.query);
    const [ov, theoKhoa, theoNganh, taiGV] = await Promise.all([
      BaoCaoServices.overview(q),
      BaoCaoServices.dkTheoKhoa(q.hoc_ky_id),
      BaoCaoServices.dkTheoNganh(q.hoc_ky_id, q.khoa_id),
      BaoCaoServices.taiGiangVien(q.hoc_ky_id, q.khoa_id),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.created = new Date();
    wb.addWorksheet("Tổng quan").addRows([
      ["Chỉ số", "Giá trị"],
      ["SV đã đăng ký (unique)", ov.svUnique],
      ["Số bản ghi đăng ký", ov.soDK],
      ["Số lớp học phần mở", ov.soLHP],
      ["Thực thu (VND)", ov.taiChinh.thuc_thu],
      ["Kỳ vọng (VND)", ov.taiChinh.ky_vong],
      ["Kết luận", ov.ketLuan],
    ]);

    const ws1 = wb.addWorksheet("ĐK theo khoa");
    ws1.addRow(["Khoa", "Số đăng ký"]);
    theoKhoa.data.forEach((x) => ws1.addRow([x.ten_khoa, x.so_dang_ky]));
    ws1.addRow([]);
    ws1.addRow(["Kết luận", theoKhoa.ketLuan]);

    const ws2 = wb.addWorksheet("ĐK theo ngành");
    ws2.addRow(["Ngành", "Số đăng ký"]);
    theoNganh.data.forEach((x) => ws2.addRow([x.ten_nganh, x.so_dang_ky]));
    ws2.addRow([]);
    ws2.addRow(["Kết luận", theoNganh.ketLuan]);

    const ws3 = wb.addWorksheet("Tải giảng viên");
    ws3.addRow(["Giảng viên", "Số lớp"]);
    taiGV.data.forEach((x) => ws3.addRow([x.ho_ten, x.so_lop]));
    ws3.addRow([]);
    ws3.addRow(["Kết luận", taiGV.ketLuan]);

    const buf = await wb.xlsx.writeBuffer();
    const fname = `bao_cao_${q.hoc_ky_id}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
    res.send(Buffer.from(buf));
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

// ---- EXPORT PDF (render nhanh, text + số liệu; biểu đồ gợi ý render ở FE -> upload PNG cho bản nâng cao) ----
r.post("/export/pdf", async (req, res) => {
  // input: { hoc_ky_id, khoa?, nganh?, charts?: {name: string, dataUrl: string}[] }
  try {
    const body = req.body as any;
    const q = filterSchema.parse(body);
    const [ov, theoKhoa, theoNganh, taiGV] = await Promise.all([
      BaoCaoServices.overview(q),
      BaoCaoServices.dkTheoKhoa(q.hoc_ky_id),
      BaoCaoServices.dkTheoNganh(q.hoc_ky_id, q.khoa_id),
      BaoCaoServices.taiGiangVien(q.hoc_ky_id, q.khoa_id),
    ]);

    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const chartImgs = (body.charts || [])
      .map(
        (c: any) =>
          `<h4>${c.name}</h4><img style="max-width:100%" src="${c.dataUrl}" />`
      )
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
        <p class="muted">Kỳ: ${q.hoc_ky_id} ${
      q.khoa_id ? " | Khoa: " + q.khoa_id : ""
    } ${q.nganh_id ? " | Ngành: " + q.nganh_id : ""}</p>

        <h2>I. Tổng quan</h2>
        <table>
          <tr><th>Chỉ số</th><th>Giá trị</th></tr>
          <tr><td>SV đã đăng ký</td><td>${ov.svUnique}</td></tr>
          <tr><td>Số bản ghi đăng ký</td><td>${ov.soDK}</td></tr>
          <tr><td>Số lớp học phần mở</td><td>${ov.soLHP}</td></tr>
          <tr><td>Thực thu</td><td>${ov.taiChinh.thuc_thu.toLocaleString(
            "vi-VN"
          )} VND</td></tr>
          <tr><td>Kỳ vọng</td><td>${ov.taiChinh.ky_vong.toLocaleString(
            "vi-VN"
          )} VND</td></tr>
        </table>
        <p><b>Kết luận:</b> ${ov.ketLuan}</p>

        <h2>II. Đăng ký theo khoa</h2>
        <table>
          <tr><th>Khoa</th><th>Số đăng ký</th></tr>
          ${theoKhoa.data
            .map(
              (x) => `<tr><td>${x.ten_khoa}</td><td>${x.so_dang_ky}</td></tr>`
            )
            .join("")}
        </table>
        <p><b>Kết luận:</b> ${theoKhoa.ketLuan}</p>

        <h2>III. Đăng ký theo ngành</h2>
        <table>
          <tr><th>Ngành</th><th>Số đăng ký</th></tr>
          ${theoNganh.data
            .map(
              (x) => `<tr><td>${x.ten_nganh}</td><td>${x.so_dang_ky}</td></tr>`
            )
            .join("")}
        </table>
        <p><b>Kết luận:</b> ${theoNganh.ketLuan}</p>

        <h2>IV. Tải giảng viên</h2>
        <table>
          <tr><th>Giảng viên</th><th>Số lớp</th></tr>
          ${taiGV.data
            .map((x) => `<tr><td>${x.ho_ten}</td><td>${x.so_lop}</td></tr>`)
            .join("")}
        </table>
        <p><b>Kết luận:</b> ${taiGV.ketLuan}</p>

        ${chartImgs ? `<h2>V. Biểu đồ</h2>${chartImgs}` : ""}
      </body></html>
    `;
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bao_cao_${q.hoc_ky_id}.pdf"`
    );
    res.send(pdf);
  } catch (e: any) {
    res.status(400).json({ isSuccess: false, message: e.message });
  }
});

export default r;
