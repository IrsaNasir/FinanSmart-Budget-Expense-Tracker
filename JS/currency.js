// ===== Shared Currency System =====
const currencyRates = { Rs: 1, '$': 1/278, '£': 1/355, '€': 1/300 };

function formatAmount(amount) {
  const currency = localStorage.getItem('currency') || 'Rs';
  const rate = currencyRates[currency] || 1;
  const converted = amount * rate;
  return currency + ' ' + converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
