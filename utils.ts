import { LineItem } from './types';

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
};

export const calculateRowSubtotal = (item: LineItem) => {
  let multiplier = (item.unit === 'm²' && item.p > 0 && item.l > 0) ? item.p * item.l : 1;
  return item.qty * item.harga * multiplier;
};

export const calculateDocumentTotal = (items: LineItem[], discount: number, tax: number) => {
  const subtotal = items.reduce((acc, item) => acc + calculateRowSubtotal(item), 0);
  const discVal = subtotal * (discount / 100);
  const taxVal = (subtotal - discVal) * (tax / 100);
  const total = subtotal - discVal + taxVal;
  
  return { subtotal, discVal, taxVal, total };
};