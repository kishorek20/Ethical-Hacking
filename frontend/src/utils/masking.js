export function maskEmail(email) {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}

export function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '****'
  return '*'.repeat(digits.length - 4) + digits.slice(-4)
}

export function maskId(id) {
  const cleaned = id.replace(/[\s\-]/g, '')
  if (cleaned.length < 4) return 'XXXX'
  return 'XXXX-XXXX-' + cleaned.slice(-4)
}

export function maskName(name) {
  return name.split(' ').map(p => p[0] + '*'.repeat(Math.max(p.length - 1, 1))).join(' ')
}

export function maskAddress(address) {
  const words = address.trim().split(' ')
  if (words.length <= 2) return '***'
  return words[0] + ' ***'
}
