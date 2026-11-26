export async function sha1Hex(str) {
  const msgBuffer = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export async function getHibpParts(password) {
  const hash = await sha1Hex(password)
  return { prefix: hash.slice(0, 5), suffix: hash.slice(5) }
}
