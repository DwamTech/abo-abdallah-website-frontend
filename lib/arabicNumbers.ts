export const toArabicDigits = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
