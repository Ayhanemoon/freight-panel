export const convertToPersianDigits = (
  value: number | string
): string => {
  return String(value).replace(
    /\d/g,
    (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]
  );
};