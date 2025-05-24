const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Initialize transporter
let transporter;

const initializeTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // For testing, we can use a service like Ethereal if real SMTP is not available
  // or allow configuration via environment variables.
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_HOST) {
    // Use Ethereal for testing or if SMTP is not configured
    // This part will only work if you manually create an Ethereal account
    // and set the credentials in ENV for testing.
    // For automated tests without real email sending, nodemailer.createTestAccount() is good.
    // However, createTestAccount is async and might be better called once when app starts.
    // For simplicity here, if in test or no SMTP_HOST, we'll log instead of failing.
    console.log('SMTP_HOST not found or in test mode. Using console log for emails.');
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('--- Mock Email Sent ---');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML (first 100 chars):', mailOptions.html?.substring(0, 100) + '...');
        console.log('-----------------------');
        // To simulate Ethereal URL for testing:
        return { messageId: `mock-${Date.now()}`, previewUrl: `https://console.log/mock-email` };
      }
    };
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Optional: add TLS options if needed for specific providers
      // tls: {
      //   ciphers:'SSLv3'
      // }
    });
  }
  return transporter;
};

// Initialize it once
initializeTransporter();

/**
 * Sends an email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} htmlContent - HTML content of the email.
 * @param {string} [textContent] - Optional plain text content.
 * @returns {Promise<Object>} Nodemailer response object.
 */
const sendEmail = async (to, subject, htmlContent, textContent) => {
  if (!transporter) {
    console.error('Transporter not initialized. Email not sent.');
    // Fallback or error handling if transporter somehow isn't ready
    // This shouldn't happen with the current initializeTransporter() pattern
    // unless an async createTestAccount() was used and not awaited properly at startup.
    await initializeTransporter(); // Attempt re-init, though a bit late
  }
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'PustakBazzar'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@pustakbazzar.com'}>`,
    to,
    subject,
    html: htmlContent,
    text: textContent || htmlContent.replace(/<[^>]*>?/gm, ''), // Basic text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    // For Ethereal or similar test accounts, log the preview URL
    if (info.previewUrl) {
      console.log('Preview URL: %s', info.previewUrl);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to allow calling function to handle
  }
};

/**
 * Loads an email template and replaces placeholders.
 * @param {string} templateName - The name of the HTML template file (e.g., 'newMessageNotification').
 * @param {Object} replacements - An object where keys are placeholders (e.g., '{{userName}}') and values are their replacements.
 * @returns {Promise<string>} The HTML content with placeholders replaced.
 */
const loadTemplate = async (templateName, replacements) => {
  try {
    const filePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.html`);
    let html = await fs.promises.readFile(filePath, 'utf-8');
    for (const placeholder in replacements) {
      // Use a RegExp for global replacement of placeholders
      html = html.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replacements[placeholder]);
    }
    return html;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Could not load email template: ${templateName}`);
  }
};


module.exports = {
  sendEmail,
  loadTemplate,
  // Export initializeTransporter if you need to re-initialize or get test account elsewhere
};
