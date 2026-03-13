/**
 * Formats a date string into a human-readable localized date.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date, e.g. "March 13, 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Formats a numeric price into Indian Rupee currency format.
 * @param {number} price - Price in rupees
 * @returns {string} Formatted price, e.g. "₹1,200"
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(Number(price))) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

/**
 * Returns the initials from a full name (up to 2 characters).
 * @param {string} name - Full name
 * @returns {string} Initials, e.g. "RS" for "Rahul Sharma"
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .filter((char) => /[A-Za-z]/.test(char))
    .slice(0, 2)
    .join('')
}

/**
 * Truncates a string to the given max length, appending "..." if truncated.
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Returns a relative time string like "2 hours ago" or "3 days ago".
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const timeAgo = (dateString) => {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}
