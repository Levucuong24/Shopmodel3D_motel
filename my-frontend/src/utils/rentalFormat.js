const UNIT_LABELS = {
  month: "thang",
  week: "tuan",
  day: "ngay",
  hour: "gio",
  minute: "phut",
};

export function getRentalUnitLabel(unit) {
  return UNIT_LABELS[unit] || UNIT_LABELS.month;
}

export function formatPriceByUnit(price, unit) {
  if (typeof price !== "number") return price;
  return `${price.toLocaleString("vi-VN")}d / ${getRentalUnitLabel(unit)}`;
}

export function formatRentalDuration(value, unit) {
  const durationValue = Number(value || 1);
  return `${durationValue} ${getRentalUnitLabel(unit)}`;
}

export function formatDateTime(dateValue) {
  if (!dateValue) return "Dang cap nhat";
  return new Date(dateValue).toLocaleString("vi-VN");
}
