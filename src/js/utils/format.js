/**
 * Number formatting utilities for displaying large cookie numbers
 */

/**
 * Formats a number to abbreviated format with proper number names
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
  if (num === 0) return '0';
  if (num < 0) return '-' + formatNumber(-num, decimals);

  const absNum = Math.abs(num);
  
  // Large number names (short scale)
  const largeUnits = [
    { value: 1e33, name: 'decillion' },
    { value: 1e30, name: 'nonillion' },
    { value: 1e27, name: 'octillion' },
    { value: 1e24, name: 'septillion' },
    { value: 1e21, name: 'sextillion' },
    { value: 1e18, name: 'quintillion' },
    { value: 1e15, name: 'quadrillion' },
    { value: 1e12, name: 'trillion' },
    { value: 1e9, name: 'billion' },
    { value: 1e6, name: 'million' },
    { value: 1e3, name: 'thousand' }
  ];

  for (const unit of largeUnits) {
    if (absNum >= unit.value) {
      const value = num / unit.value;
      // For very large numbers, show fewer decimals
      const displayDecimals = absNum >= 1e15 ? Math.min(decimals, 1) : decimals;
      return value.toFixed(displayDecimals) + ' ' + unit.name;
    }
  }

  return num.toFixed(decimals);
}

/**
 * Formats a number to scientific notation
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number in scientific notation
 */
export function formatScientific(num, decimals = 2) {
  if (num === 0) return '0';
  return num.toExponential(decimals);
}

