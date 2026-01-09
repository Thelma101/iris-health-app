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