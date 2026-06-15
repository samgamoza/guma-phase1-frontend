import { Resend } from 'resend'
import { logger } from '../utils/logger.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM      = process.env.FROM_EMAIL  || 'Jake <jake@guma.ai>'
const REPLY_TO  = process.env.REPLY_TO    || 'jake@guma.ai'

/**
 * sendEmail()
 * Sends a single transactional email via Resend.
 * Returns { id } on success, throws on failure.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error('sendEmail: missing `to` address')

  const { data, error } = await resend.emails.send({
    from:     FROM,
    reply_to: REPLY_TO,
    to:       [to],
    subject,
    html,
    text,
  })

  if (error) {
    logger.error('Resend error', { to, subject, error: error.message })
    throw new Error(`Resend: ${error.message}`)
  }

  logger.info(`Email sent → ${to}`, { id: data.id, subject })
  return data // { id }
}

/**
 * validateEmail()
 * Very lightweight check before attempting to send.
 */
export function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
