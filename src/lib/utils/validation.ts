export function sanitizeInput(input: string): string {
  return input
    .replaceAll('<', '')
    .replaceAll('>', '')
    .trim()
    .slice(0, 1000)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateFile(file: File): {
  valid: boolean
  error?: string
} {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must not exceed 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed. Only JPG, PNG, and PDF files are accepted.' }
  }
  
  return { valid: true }
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return phoneRegex.test(phone)
}

export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s-']{2,50}$/
  return nameRegex.test(name)
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replaceAll(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase()
    .slice(0, 100)
}

// Date utility functions
/**
 * Convert DD/MM/YYYY to YYYY-MM-DD for HTML date inputs
 */
export function toISODateFormat(displayDate: string): string {
  if (!displayDate) return '';
  
  // Handle invalid/placeholder values
  if (displayDate === 'N/A' || displayDate === 'n/a' || displayDate === '-' || displayDate === 'undefined') {
    return '';
  }
  
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(displayDate)) {
    return displayDate.split('T')[0];
  }
  
  // DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(displayDate)) {
    const [day, month, year] = displayDate.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try parsing as date
  try {
    const date = new Date(displayDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Fallback - return empty for invalid dates
  }
  
  // Return empty string instead of invalid date string for HTML date inputs
  return '';
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY for display
 */
export function toDisplayDateFormat(isoDate: string): string {
  if (!isoDate) return '';
  
  // Already in display format
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(isoDate)) {
    return isoDate;
  }
  
  // ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(isoDate)) {
    const [year, month, day] = isoDate.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Try parsing as date
  try {
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } catch {
    // Fallback
  }
  
  return isoDate;
}

/**
 * Calculate age from date string
 */
export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * Validate and normalize age value
 */
export function normalizeAge(ageInput: string | number): string {
  if (typeof ageInput === 'number') {
    return ageInput >= 0 ? String(ageInput) : '0';
  }
  
  // Remove 'yrs', 'years', etc.
  const numericPart = String(ageInput).replace(/[^\d]/g, '');
  const age = parseInt(numericPart, 10);
  
  return isNaN(age) || age < 0 ? '0' : String(age);
}