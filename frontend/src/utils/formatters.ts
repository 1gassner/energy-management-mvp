/**
 * Format number with locale-specific formatting
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Format energy consumption values
 */
export const formatEnergy = (value: number): string => {
  if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 2)} MWh`;
  } else if (value >= 1000) {
    return `${formatNumber(value / 1000, 1)} MWh`;
  }
  return `${formatNumber(value)} kWh`;
};

/**
 * Format date and time
 */
export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date));
};

/**
 * Format date only
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium'
  }).format(new Date(date));
};

/**
 * Format time only
 */
export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('de-DE', {
    timeStyle: 'short'
  }).format(new Date(date));
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Minute${diffMins === 1 ? '' : 'n'}`;
  if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
  
  return formatDate(date);
};