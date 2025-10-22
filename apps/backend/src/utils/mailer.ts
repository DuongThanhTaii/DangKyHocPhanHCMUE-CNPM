import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // app password
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    from: `"HCMUE Portal" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  });
}
