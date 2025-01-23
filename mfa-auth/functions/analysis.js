import auth from '../auth/2fa.js'

const validate = async (req) => {
  const url = new URL (req.url)
  const code = url.searchParams.get('code')
  const secret = url.searchParams.get('secret')
  if (!code) return new Response('No code provided', { status: 400 })
  const isValid = auth.totp.verify({
    secret: secret,
    encoding: "base32",
    token: code,
    window: 6,
  })
  if (!isValid) return new Response('Invalid code', { status: 400 })
  return new Response('Valid code', { status: 200 })
}

export default validate

export const config = {
  method: "GET",
  path: "/analysis"
}