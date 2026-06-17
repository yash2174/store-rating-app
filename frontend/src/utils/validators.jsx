export function validateName(value) {
  if (!value || value.trim().length < 20) return 'Name must be at least 20 characters';
  if (value.trim().length > 60) return 'Name must not exceed 60 characters';
  return null;
}

export function validateEmail(value) {
  if (!value) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 16) return 'Password must not exceed 16 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[^a-zA-Z0-9]/.test(value)) return 'Password must contain at least one special character';
  return null;
}

export function validateAddress(value) {
  if (value && value.length > 400) return 'Address must not exceed 400 characters';
  return null;
}
