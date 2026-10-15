export const money = (minor: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    minor / 100,
  );
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
