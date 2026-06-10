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

export const sendOTPEmail = async ({ email, otp }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("SMTP is not configured. Skip sending OTP email.");
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "[HOMIE] Ma xac nhan (OTP) khoi phuc mat khau",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #ff6a00; text-align: center;">Mã xác nhận OTP</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu khôi phục mật khẩu trên hệ thống <strong>HOMIE</strong>. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình đổi mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #09090b; background-color: #f4f4f5; padding: 10px 20px; border-radius: 4px; border: 1px solid #e4e4e7;">
            ${otp}
          </span>
        </div>
        <p style="color: #ef4444; font-size: 13px;">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
        <p style="font-size: 12px; color: #71717a; text-align: center;">Đây là email tự động từ hệ thống HOMIE, vui lòng không trả lời email này.</p>
      </div>
    `,
  });

  return { skipped: false };
};
