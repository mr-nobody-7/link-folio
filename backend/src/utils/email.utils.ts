type BrevoEmailInput = {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function getBrevoConfig(): {
  apiKey: string;
  senderEmail: string;
  senderName: string;
} {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'LinkFolio';

  if (!apiKey || !senderEmail) {
    throw new Error(
      'BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured for password reset emails'
    );
  }

  return { apiKey, senderEmail, senderName };
}

export async function sendBrevoEmail(input: BrevoEmailInput): Promise<void> {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email: input.toEmail,
          name: input.toName || input.toEmail,
        },
      ],
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`Brevo email send failed: ${response.status} ${errorPayload}`);
  }
}
