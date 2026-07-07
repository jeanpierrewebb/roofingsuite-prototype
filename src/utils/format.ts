export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  return phone;
}

export function telHref(phone: string | null | undefined): string {
  if (!phone) return '';
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}
