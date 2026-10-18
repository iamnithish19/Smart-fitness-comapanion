// src/services/currencyService.js
// Exchange rate: 1 USD = 83 INR
export const USD_TO_INR_RATE = 83;

export function getSavedCurrency() {
  try {
    return localStorage.getItem('sfc_currency_preference') || 'INR';
  } catch {
    return 'INR';
  }
}

export function saveCurrency(currency) {
  try {
    localStorage.setItem('sfc_currency_preference', currency);
  } catch (err) {
    console.error('Failed to save currency preference', err);
  }
}

export function convertAmount(amountInUSD, currency = 'INR') {
  const num = Number(amountInUSD || 0);
  if (currency === 'INR') {
    return Math.round(num * USD_TO_INR_RATE);
  }
  return num;
}

export function formatCurrency(amountInUSD, currency = 'INR') {
  const converted = convertAmount(amountInUSD, currency);
  if (currency === 'INR') {
    return `₹${converted.toLocaleString('en-IN')}`;
  }
  return `$${converted.toLocaleString('en-US')}`;
}
