import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers for German locale
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format energy values with appropriate unit
 */
export function formatEnergy(value: number): string {
  if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 1)} GWh`;
  } else if (value >= 1000) {
    return `${formatNumber(value / 1000, 1)} MWh`;
  } else {
    return `${formatNumber(value, 1)} kWh`;
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

/**
 * Format date for German locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date and time for German locale
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Calculate time ago in German
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'gerade eben';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `vor ${minutes} Minute${minutes === 1 ? '' : 'n'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `vor ${hours} Stunde${hours === 1 ? '' : 'n'}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
  } else {
    return formatDate(d);
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate color based on building type
 */
export function getBuildingColor(type: string): string {
  const colors = {
    rathaus: 'bg-blue-500',
    grundschule: 'bg-green-500',
    realschule: 'bg-purple-500',
    other: 'bg-gray-500',
  };
  return colors[type as keyof typeof colors] || colors.other;
}

/**
 * Generate status color based on status
 */
export function getStatusColor(status: string): string {
  const colors = {
    online: 'text-green-600 bg-green-100',
    offline: 'text-red-600 bg-red-100',
    maintenance: 'text-yellow-600 bg-yellow-100',
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    error: 'text-red-600 bg-red-100',
  };
  return colors[status as keyof typeof colors] || colors.error;
}

/**
 * Generate alert priority color
 */
export function getAlertColor(priority: string): string {
  const colors = {
    low: 'text-blue-600 bg-blue-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100',
  };
  return colors[priority as keyof typeof colors] || colors.medium;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate efficiency based on consumption and production
 */
export function calculateEfficiency(consumption: number, production: number): number {
  if (consumption === 0) return 0;
  return Math.min(100, (production / consumption) * 100);
}

/**
 * Calculate CO2 savings based on renewable energy production
 */
export function calculateCO2Savings(renewableEnergyKWh: number): number {
  // Average CO2 emission factor for German electricity grid: ~400g CO2/kWh
  // Renewable energy saves this amount
  const co2FactorKgPerKWh = 0.4;
  return renewableEnergyKWh * co2FactorKgPerKWh;
}