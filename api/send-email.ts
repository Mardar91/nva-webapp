import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Tipo per la richiesta
interface RomanticWeekRequest {
  name: string;
  surname: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  message?: string;
}

// Configurazione del transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // true per 465, false per altri porti
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Verifica che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      surname,
      email,
      phone,
      checkIn,
      checkOut,
      message,
    } = req.body as RomanticWeekRequest;

    // Validazione base dei campi richiesti
    if (!name || !surname || !email || !phone || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Prepara il contenuto dell'email
    const emailContent = `
      <h2>New Romantic Week Package Request</h2>
      <p><strong>Name:</strong> ${name} ${surname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Number of guests:</strong> 2</p>
      ${message ? `<p><strong>Additional message:</strong> ${message}</p>` : ''}
    `;

    // Invia l'email
    await transporter.sendMail({
      from: process.env.BREVO_SMTP_USER,
      to: 'info@nonnavittoriaapartments.it',
      subject: 'New Romantic Week Package Request',
      html: emailContent,
      replyTo: email,
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
