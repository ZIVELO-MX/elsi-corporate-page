const adminMoneyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const adminDateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export function formatAdminMoney(amount: number) {
  return adminMoneyFormatter.format(amount);
}

export function formatAdminDate(value: string) {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "—";
  return adminDateFormatter.format(date);
}

export function newestFirst<T>(items: T[], dateOf: (item: T) => string) {
  return [...items].sort((left, right) => dateOf(right).localeCompare(dateOf(left)));
}
