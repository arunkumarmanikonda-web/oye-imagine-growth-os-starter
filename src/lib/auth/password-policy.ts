export type PasswordPolicyResult = {
  valid: boolean
  issues: string[]
}

export function validateNewPassword(password: string): PasswordPolicyResult {
  const issues: string[] = []
  if (password.length < 12) issues.push('Use at least 12 characters.')
  if (!/[a-z]/.test(password)) issues.push('Add a lowercase letter.')
  if (!/[A-Z]/.test(password)) issues.push('Add an uppercase letter.')
  if (!/[0-9]/.test(password)) issues.push('Add a number.')
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('Add a symbol.')
  return { valid: issues.length === 0, issues }
}
