import nodemailer from "nodemailer";

const adminRecipient = process.env.ADMIN_NOTIFY_EMAIL || "levucuong0319@gmail.com";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendAdminPaymentNotification = async ({ customerName, customerEmail, amount }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("SMTP is not configured. Skip sending payment notification email.");
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminRecipient,
    subject: "Thong bao thanh toan phong",
    text: `Ten: ${customerName}\nEmail: ${customerEmail}\nSo tien: ${Number(amount || 0).toLocaleString("vi-VN")} VND`,
  });

  return { skipped: false };
};
