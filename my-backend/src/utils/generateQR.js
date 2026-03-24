export const generateQR = ({
  bank_code = "MB",
  account_number = "0352824919",
  account_name = "LE VU CUONG",
  amount,
  content,
}) => {
  const qr_url = `https://img.vietqr.io/image/${bank_code}-${account_number}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(account_name)}`;

  return {
    qr_content: content,
    qr_url,
  };
};
