/** Decimal USD input to integer cents. Rejects excess precision and unsafe values; never rounds. */
export function decimalToMinor(input: string, maximum = Number.MAX_SAFE_INTEGER): number {
  const value = input.trim().replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0)).replace("٫", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Enter an amount with at most two decimal places.");
  const [whole, fraction = ""] = value.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(maximum) || maximum < 0 || minor > BigInt(maximum)) throw new Error("Amount exceeds the allowed maximum.");
  return Number(minor);
}

/** Exact round trip for persisted integer cents, including zero and values above float precision. */
export function minorToDecimal(minor: number): string {
  if (!Number.isSafeInteger(minor) || minor < 0) throw new Error("Invalid monetary value.");
  const value = BigInt(minor);
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}
