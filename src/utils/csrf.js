/** Read Django CSRF cookie (set on first GET to the site root). */
export function getCsrfToken() {
  const name = 'csrftoken'
  if (typeof document === 'undefined' || !document.cookie) return ''
  const cookies = document.cookie.split(';')
  for (const raw of cookies) {
    const cookie = raw.trim()
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.slice(name.length + 1))
    }
  }
  return ''
}
