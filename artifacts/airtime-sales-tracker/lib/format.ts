import { Sale } from '@/context/AppDataContext';

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number) {
  return naira.format(amount);
}

export function isToday(isoDate: string) {
  const value = new Date(isoDate);
  const today = new Date();
  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

export function formatSaleDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function getSalesTotal(sales: Sale[]) {
  return sales.reduce((total, sale) => total + sale.amount, 0);
}
