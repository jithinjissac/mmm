/**
 * Format a number as currency (GBP)
 * @param amount The amount to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: {
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string {
  const { currency = "GBP", minimumFractionDigits = 2, maximumFractionDigits = 2 } = options

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Format a number with commas
 * @param num The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-GB").format(num)
}

// Add the formatDate function to the existing file
/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options: {
    day?: "numeric" | "2-digit"
    month?: "numeric" | "2-digit" | "long" | "short" | "narrow"
    year?: "numeric" | "2-digit"
  } = {},
): string {
  const { day = "numeric", month = "long", year = "numeric" } = options

  const date = dateString instanceof Date ? dateString : new Date(dateString)

  return new Intl.DateTimeFormat("en-GB", {
    day,
    month,
    year,
  }).format(date)
}
