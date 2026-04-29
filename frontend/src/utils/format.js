export function formatCurrencyTND(value) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} TND`;
  }
}

