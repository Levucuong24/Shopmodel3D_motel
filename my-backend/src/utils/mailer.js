import nodemailer from "nodemailer";

const adminRecipient = process.env.ADMIN_NOTIFY_EMAIL || "levucuong0319@gmail.com";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const isSecure = SMTP_SECURE === "true" || (SMTP_PORT === "465" && SMTP_SECURE !== "false");

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: isSecure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
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
    subject: "Thông báo thanh toán phòng",
    text: `Tên: ${customerName}\nEmail: ${customerEmail}\nSố tiền: ${Number(amount || 0).toLocaleString("vi-VN")} VND`,
  });

  return { skipped: false };
};

export const sendOTPEmail = async ({ email, otp }) => {
  const scriptUrl = process.env.GOOGLE_APP_SCRIPT_URL;
  const resendApiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
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
  `;

  const errors = [];

  // 1. Thử gửi qua Resend API
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
          "User-Agent": "HomieApp/1.0",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: email,
          subject: "[HOMIE] Mã xác nhận (OTP) khôi phục mật khẩu",
          html: htmlContent,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `HTTP error ${response.status}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `Yêu cầu thất bại với mã lỗi ${response.status}`);
      }
      return { success: true };
    } catch (resendError) {
      console.error("Failed to send OTP email via Resend, trying fallback:", resendError);
      errors.push(`Resend API: ${resendError.message}`);
    }
  }

  // 2. Thử gửi qua Google Apps Script
  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "[HOMIE] Mã xác nhận (OTP) khôi phục mật khẩu",
          html: htmlContent,
          secret: process.env.SMTP_PASS || "ybnp meqq mjyu gipk",
        }),
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `HTTP error ${response.status}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || `Yêu cầu thất bại với mã lỗi ${response.status}`);
      }
      return { success: true };
    } catch (fetchError) {
      console.error("Failed to send OTP email via Google Apps Script, trying fallback:", fetchError);
      errors.push(`Google Apps Script: ${fetchError.message}`);
    }
  }

  // 3. Thử gửi qua SMTP (Nodemailer)
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "[HOMIE] Mã xác nhận (OTP) khôi phục mật khẩu",
        html: htmlContent,
      });
      return { success: true };
    } catch (smtpError) {
      console.error("Failed to send OTP email via SMTP:", smtpError);
      errors.push(`SMTP: ${smtpError.message}`);
    }
  } else {
    errors.push("SMTP is not configured.");
  }

  // Nếu đi đến đây thì toàn bộ các phương pháp đều thất bại
  throw new Error(`Không thể gửi email OTP. Chi tiết lỗi: ${errors.join(" | ")}`);
};
