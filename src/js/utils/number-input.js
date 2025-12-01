/**
 * Utility functions for number input with multiplier dropdown
 */

/**
 * Multiplier options for large numbers
 */
export const MULTIPLIERS = [
  { value: 1, label: '' },
  { value: 1e3, label: 'Thousand' },
  { value: 1e6, label: 'Million' },
  { value: 1e9, label: 'Billion' },
  { value: 1e12, label: 'Trillion' },
  { value: 1e15, label: 'Quadrillion' },
  { value: 1e18, label: 'Quintillion' },
  { value: 1e21, label: 'Sextillion' },
  { value: 1e24, label: 'Septillion' },
  { value: 1e27, label: 'Octillion' },
  { value: 1e30, label: 'Nonillion' },
  { value: 1e33, label: 'Decillion' },
  { value: 1e36, label: 'Undecillion' },
  { value: 1e39, label: 'Duodecillion' },
  { value: 1e42, label: 'Tredecillion' },
  { value: 1e45, label: 'Quattuordecillion' },
  { value: 1e48, label: 'Quindecillion' },
  { value: 1e51, label: 'Sexdecillion' },
  { value: 1e54, label: 'Septendecillion' },
  { value: 1e57, label: 'Octodecillion' },
  { value: 1e60, label: 'Novemdecillion' },
  { value: 1e63, label: 'Vigintillion' },
  { value: 1e66, label: 'Unvigintillion' }
];

/**
 * Decompose a number into base value and multiplier
 * @param {number} value - The number to decompose
 * @returns {Object} { base: number, multiplier: number }
 */
export function decomposeNumber(value) {
  if (!value || value === 0 || !isFinite(value)) {
    return { base: 0, multiplier: 1 };
  }

  // Find the largest multiplier that divides evenly
  for (let i = MULTIPLIERS.length - 1; i >= 0; i--) {
    const multiplier = MULTIPLIERS[i].value;
    if (value >= multiplier) {
      const base = value / multiplier;
      // Only use multiplier if base is a reasonable number (not too large) and divides evenly
      if (base < 10000 && Math.abs(base - Math.round(base)) < 0.0001) {
        return { base: Math.round(base), multiplier };
      }
    }
  }

  // If no multiplier fits, return as-is with multiplier 1
  return { base: value, multiplier: 1 };
}

/**
 * Compose a number from base value and multiplier
 * @param {number} base - Base value
 * @param {number} multiplier - Multiplier value
 * @returns {number} The composed number
 */
export function composeNumber(base, multiplier) {
  return base * multiplier;
}

/**
 * Render a number input with multiplier dropdown
 * @param {string} inputId - ID for the number input
 * @param {string} selectId - ID for the multiplier select
 * @param {number} currentValue - Current total value
 * @param {string} label - Label text
 * @param {string} errorId - ID for error message element (optional)
 * @returns {string} HTML string
 */
export function renderNumberInputWithMultiplier(inputId, selectId, currentValue, label, errorId = null, required = false) {
  const { base, multiplier } = decomposeNumber(currentValue || 0);
  const multiplierIndex = MULTIPLIERS.findIndex(m => Math.abs(m.value - multiplier) < 0.0001);
  const selectedMultiplier = multiplierIndex >= 0 ? multiplierIndex : 0;

  // Check if label ends with * to indicate required
  const isRequired = required || label.includes('*');
  const cleanLabel = label.replace(/\s*\*$/, '');

  return `
    <div class="form-group">
      <label for="${inputId}">${cleanLabel}${isRequired ? ' *' : ''}</label>
      <div class="number-input-with-multiplier">
        <input
          type="number"
          id="${inputId}"
          min="0"
          step="0.01"
          value="${base}"
          class="form-input number-input-base"
          data-multiplier-input="true"
          ${isRequired ? 'required aria-required="true"' : ''}
        >
        <select
          id="${selectId}"
          class="form-input multiplier-select"
          data-multiplier-select="true"
        >
          ${MULTIPLIERS.map((m, index) => `
            <option value="${m.value}" ${index === selectedMultiplier ? 'selected' : ''}>
              ${m.label || 'None'}
            </option>
          `).join('')}
        </select>
      </div>
      ${errorId ? `<span id="${errorId}" class="error-message" role="alert"></span>` : ''}
    </div>
  `;
}

/**
 * Get the composed value from a number input with multiplier
 * @param {string} inputId - ID of the number input
 * @param {string} selectId - ID of the multiplier select
 * @returns {number} The composed number value
 */
export function getNumberInputWithMultiplierValue(inputId, selectId) {
  const input = document.getElementById(inputId);
  const select = document.getElementById(selectId);
  
  if (!input || !select) {
    return 0;
  }

  const base = parseFloat(input.value) || 0;
  const multiplier = parseFloat(select.value) || 1;
  
  return composeNumber(base, multiplier);
}

