export function formatMoneyFromCents(
  cents: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatMoney(cents: number, currency: string = "USD") {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

