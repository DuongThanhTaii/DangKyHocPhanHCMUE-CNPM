// mailer.ts
import nodemailer from "nodemailer";

const {
  MAIL_USER = "",
  MAIL_PASS = "",
  MAIL_FROM_NAME = "HCMUE Portal",
  MAIL_FROM_ADDR = "", // nếu rỗng sẽ dùng MAIL_USER
} = process.env;

// Khuyên dùng App Password của Gmail (2FA) thay vì mật khẩu đăng nhập
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

function buildResetTemplate(resetUrl: string) {
  const subject = "Xác thực yêu cầu đổi mật khẩu - HCMUE";
  const text = [
    "Thân gửi,",
    "Bạn đã đề nghị đổi mật khẩu tài khoản trường Đại học Sư Phạm Thành phố Hồ Chí Minh.",
    "Để xác thực yêu cầu, bạn vui lòng truy cập vào link sau để reset mật khẩu:",
    resetUrl,
    "",
    "Bạn cần bảo mật tuyệt đối tài khoản của mình, vì nó gắn liền với hồ sơ của bạn.",
    "Đây là thư tự động từ hệ thống quản lý học tập của trường Đại học Sư Phạm Thành phố Hồ Chí Minh.",
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#0f172a">
    <p>Thân gửi,</p>
    <p>
      Bạn đã đề nghị đổi mật khẩu tài khoản trường <strong>Đại học Sư Phạm Thành phố Hồ Chí Minh</strong>.
      Để xác thực yêu cầu, bạn vui lòng truy cập vào link sau:
    </p>
    <p style="margin:24px 0">
      <a href="${resetUrl}" target="_blank" rel="noopener"
         style="display:inline-block;padding:12px 20px;border-radius:10px;text-decoration:none;background:#0c4874;color:#fff;font-weight:600">
        Reset mật khẩu
      </a>
    </p>
    <p style="word-break:break-all;margin-top:8px">
      Hoặc dán liên kết vào trình duyệt: <br>
      <a href="${resetUrl}" style="color:#0c4874">${resetUrl}</a>
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
    <p>
      Bạn cần bảo mật tuyệt đối tài khoản của mình, vì nó gắn liền với hồ sơ của bạn.
    </p>
    <p style="color:#475569;font-size:13px">
      Đây là thư tự động từ hệ thống quản lý học tập của trường Đại học Sư Phạm Thành phố Hồ Chí Minh.
    </p>
  </div>`;
  return { subject, text, html };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { subject, text, html } = buildResetTemplate(resetUrl);
  await transporter.sendMail({
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDR || MAIL_USER}>`,
    to,
    subject,
    text, // fallback cho client không hỗ trợ HTML
    html, // nội dung HTML chính
    replyTo: "duongthanhtai13@gmail.com",
    headers: {
      "X-Entity-Ref-ID": "hcmue-password-reset",
    },
  });
}

// Nếu vẫn muốn hàm tổng quát:
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  await transporter.sendMail({
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDR || MAIL_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo: "duongthanhtai13@gmail.com",
  });
}
