/**
 * Format Utility Functions
 * Handles formatting of various data types
 */

export const formatUtil = {
  /**
   * Format currency
   */
  currency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format phone number
   */
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  },

  /**
   * Format percentage
   */
  percentage: (value: number, decimals: number = 2): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format file size
   */
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Capitalize string
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Capitalize each word
   */
  titleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  /**
   * Truncate string
   */
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Format email (hide some characters)
   */
  maskEmail: (email: string): string => {
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
  },

  /**
   * Format phone (hide some digits)
   */
  maskPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    const lastFour = cleaned.slice(-4);
    return `****-****-${lastFour}`;
  },

  /**
   * Format number with thousand separator
   */
  number: (num: number, decimals: number = 0): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /**
   * Convert snake_case to camelCase
   */
  snakeToCamel: (str: string): string => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake: (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },

  /**
   * Format user name
   */
  userName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },

  /**
   * Format role label
   */
  roleLabel: (role: string): string => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
};
