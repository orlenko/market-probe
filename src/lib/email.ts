import nodemailer from 'nodemailer'
import type { FormData } from '@/types/database'

// Email configuration
const emailConfig = {
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_SMTP_USERNAME || process.env.MAILGUN_DOMAIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD || process.env.MAILGUN_API_KEY,
    },
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
}

// Create transporter based on available configuration
function createTransporter() {
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return nodemailer.createTransport(emailConfig.mailgun)
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport(emailConfig.smtp)
  } else {
    console.warn('No email configuration found. Emails will be logged to console.')
    return null
  }
}

const transporter = createTransporter()

// Email templates
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

function createFormSubmissionEmail(
  projectTitle: string,
  formData: FormData,
  submissionDetails: {
    submittedAt: Date
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
): EmailTemplate {
  const { email, name, company, message, ...customFields } = formData
  const { submittedAt, referrer, utmSource, utmMedium, utmCampaign } = submissionDetails

  const subject = `New ${projectTitle} Waitlist Signup: ${name || email}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
        🎉 New Waitlist Signup for ${projectTitle}
      </h2>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #475569; margin-top: 0;">Contact Information</h3>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        ${message ? `
          <div style="margin-top: 15px;">
            <strong>Message:</strong>
            <div style="background: white; padding: 10px; border-left: 3px solid #6366f1; margin-top: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}
      </div>

      ${Object.keys(customFields).length > 0 ? `
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #475569; margin-top: 0;">Additional Information</h3>
          ${Object.entries(customFields).map(([key, value]) =>
            `<p><strong>${key}:</strong> ${value}</p>`
          ).join('')}
        </div>
      ` : ''}

      <div style="background: #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #475569; margin-top: 0;">Submission Details</h3>
        <p><strong>Submitted:</strong> ${submittedAt.toLocaleString()}</p>
        ${referrer ? `<p><strong>Referrer:</strong> ${referrer}</p>` : ''}
        ${utmSource ? `<p><strong>Source:</strong> ${utmSource}</p>` : ''}
        ${utmMedium ? `<p><strong>Medium:</strong> ${utmMedium}</p>` : ''}
        ${utmCampaign ? `<p><strong>Campaign:</strong> ${utmCampaign}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <p style="margin: 0; color: #0369a1;">
          <strong>View all submissions in your MarketProbe admin dashboard</strong>
        </p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin"
           style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">
          Open Admin Dashboard
        </a>
      </div>
    </div>
  `

  const text = `
New ${projectTitle} Waitlist Signup

Contact Information:
- Email: ${email}
${name ? `- Name: ${name}` : ''}
${company ? `- Company: ${company}` : ''}
${message ? `- Message: ${message}` : ''}

${Object.keys(customFields).length > 0 ?
  'Additional Information:\n' +
  Object.entries(customFields).map(([key, value]) => `- ${key}: ${value}`).join('\n') + '\n'
  : ''
}

Submission Details:
- Submitted: ${submittedAt.toLocaleString()}
${referrer ? `- Referrer: ${referrer}` : ''}
${utmSource ? `- Source: ${utmSource}` : ''}
${utmMedium ? `- Medium: ${utmMedium}` : ''}
${utmCampaign ? `- Campaign: ${utmCampaign}` : ''}

View all submissions: ${process.env.NEXT_PUBLIC_BASE_URL}/admin
  `

  return { subject, html, text }
}

// Main email sending function
export async function sendFormSubmissionNotification(
  projectTitle: string,
  formData: FormData,
  submissionDetails: {
    submittedAt: Date
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailTemplate = createFormSubmissionEmail(projectTitle, formData, submissionDetails)

    const mailOptions = {
      from: process.env.MAILGUN_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@marketprobe.app',
      to: process.env.NOTIFICATION_EMAIL || 'admin@marketprobe.app',
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    }

    if (transporter) {
      const result = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return { success: true }
    } else {
      // Fallback: log to console if no email config
      console.log('=== EMAIL NOTIFICATION ===')
      console.log('To:', mailOptions.to)
      console.log('Subject:', mailOptions.subject)
      console.log('Content:', emailTemplate.text)
      console.log('========================')
      return { success: true }
    }
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Health check for email service
export async function checkEmailService(): Promise<boolean> {
  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email service verification failed:', error)
    return false
  }
}

// Email validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
