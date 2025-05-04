import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS
  }
});

/*
export async function sendCriticalEmail({
  name,
  age,
  complaint,
  esi,
  reason,
  queue
}) {
  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_USER,
    to: process.env.ALERT_EMAIL_TO,
    subject: 'ALERT: A patient has been triaged as critical.',
    text: `ALERT: A patient has been triaged as critical.

Name: ${name}
Age: ${age}
Complaint: ${complaint}
AI Triage Level: ${esi}
Reason: ${reason}
Queue #: ${queue}

Please assist immediately.`
  });
}

*/

// utils/email.js
// ------------------------------------------------------------------  
// Email functionality is stubbed out for now.  
// sendCriticalEmail will do nothing until you wire up Nodemailer.
export async function sendCriticalEmail(/* patientRecord */) {
    // no-op stub
    console.log('[stub] sendCriticalEmail called, skipping email.');
  }

