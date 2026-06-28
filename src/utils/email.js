const nodemailer = require('nodemailer');
require('dotenv').config();
const { FRONTEND_URL } = require('../config/app');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

// ── Template de base ──────────────────────────────────────────────────────────

const baseTemplate = ({ color, title, body, footer }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- En-tête marque -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
                Dahira App
              </p>
              <div style="margin-top:6px;height:2px;width:32px;background:${color};border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Carte principale -->
          <tr>
            <td style="background:#ffffff;border-radius:8px;border-top:3px solid ${color};padding:36px 40px;">
              ${body}
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:24px 0 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                ${footer || 'Cet email a été envoyé automatiquement — merci de ne pas y répondre.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Styles réutilisables ──────────────────────────────────────────────────────

const greeting = (name) =>
  `<p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Assalamu alaykum <strong>${name}</strong>,</p>`;

const paragraph = (text) =>
  `<p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.7;">${text}</p>`;

const ctaLink = (href, label, color) => `
  <p style="margin:28px 0;">
    <a href="${href}"
       style="color:${color};font-size:15px;font-weight:600;text-decoration:none;">
      → ${label}
    </a>
  </p>
`;

const urlBox = (url) =>
  `<p style="margin:0 0 20px;font-size:12px;color:#a1a1aa;word-break:break-all;background:#fafafa;border:1px solid #e4e4e7;border-radius:4px;padding:10px 14px;">${url}</p>`;

const alertBox = (text) =>
  `<p style="margin:20px 0 0;font-size:13px;color:#78716c;background:#fafaf9;border-left:3px solid #d4d4d8;padding:10px 14px;border-radius:0 4px 4px 0;">${text}</p>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #f4f4f5;margin:24px 0;" />`;

const signOff = () =>
  `<p style="margin:0;font-size:14px;color:#71717a;">Barak Allahu fik,<br><strong style="color:#3f3f46;">L'équipe Dahira App</strong></p>`;

// ── Emails ────────────────────────────────────────────────────────────────────

const sendInvitationEmail = async (toEmail, toName, invitationLink, dahiraName, invitedBy) => {
  const color = '#16a34a';

  const html = baseTemplate({
    color,
    title: `Invitation à rejoindre ${dahiraName}`,
    body: `
      ${greeting(toName)}
      ${paragraph(`<strong>${invitedBy}</strong> vous invite à rejoindre <strong>${dahiraName}</strong> sur l'application de gestion Dahira.`)}
      ${paragraph('Cliquez sur le lien ci-dessous pour accepter cette invitation et créer votre compte :')}
      ${ctaLink(invitationLink, "Accepter l'invitation", color)}
      ${urlBox(invitationLink)}
      ${alertBox('Ce lien est valide pendant <strong>7 jours</strong> et ne peut être utilisé qu\'une seule fois.')}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Invitation à rejoindre ${dahiraName}`,
    html,
  });

  console.log('Email d\'invitation envoyé:', info.messageId);
  return { success: true, messageId: info.messageId };
};

const sendWelcomeEmail = async (toEmail, toName, dahiraName) => {
  const color = '#16a34a';

  const html = baseTemplate({
    color,
    title: `Bienvenue sur ${dahiraName}`,
    body: `
      ${greeting(toName)}
      ${paragraph(`Votre compte a été créé avec succès. Vous êtes désormais membre de <strong>${dahiraName}</strong>.`)}
      ${paragraph('Vous pouvez dès maintenant vous connecter à l\'application avec votre email et le mot de passe que vous avez défini.')}
      ${paragraph('N\'hésitez pas à contacter les responsables de votre Dahira si vous avez des questions.')}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Bienvenue dans ${dahiraName}`,
    html,
  });

  console.log('Email de bienvenue envoyé:', info.messageId);
  return { success: true, messageId: info.messageId };
};

const sendPasswordResetEmail = async (toEmail, toName, resetLink) => {
  const color = '#dc2626';

  const html = baseTemplate({
    color,
    title: 'Réinitialisation de votre mot de passe',
    body: `
      ${greeting(toName)}
      ${paragraph('Vous avez demandé la réinitialisation de votre mot de passe.')}
      ${paragraph('Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :')}
      ${ctaLink(resetLink, 'Réinitialiser mon mot de passe', color)}
      ${urlBox(resetLink)}
      ${alertBox('Ce lien est valide pendant <strong>1 heure</strong> seulement. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email.')}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Réinitialisation de votre mot de passe',
    html,
  });

  console.log('Email de réinitialisation envoyé:', info.messageId);
  return { success: true, messageId: info.messageId };
};

const sendNotificationEmail = async (toEmail, title, message, link) => {
  const color = '#2563eb';

  const html = baseTemplate({
    color,
    title,
    body: `
      ${paragraph(message)}
      ${link ? ctaLink(`${FRONTEND_URL}${link}`, 'Voir dans l\'application', color) : ''}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: title,
    html,
  });

  return { success: true, messageId: info.messageId };
};

const sendRecuEmail = async (toEmail, toName, recuNumber, pdfPath) => {
  const color = '#0891b2';

  const html = baseTemplate({
    color,
    title: `Reçu de cotisation — ${recuNumber}`,
    body: `
      ${greeting(toName)}
      ${paragraph('Votre cotisation a été enregistrée avec succès.')}
      ${paragraph(`Vous trouverez ci-joint votre reçu de paiement <strong>N° ${recuNumber}</strong>.`)}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Reçu de cotisation — ${recuNumber}`,
    html,
    attachments: [{ filename: `${recuNumber}.pdf`, path: pdfPath }],
  });

  console.log('Reçu envoyé par email:', info.messageId);
  return { success: true, messageId: info.messageId };
};

const sendRelanceEmail = async (toEmail, toName, dahiraName, cotisations) => {
  const color = '#d97706';
  const fmt = (n) =>
    Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const lignes = cotisations
    .map(
      (c) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#52525b;border-bottom:1px solid #f4f4f5;">${fmtDate(c.date_seance)}</td>
          <td style="padding:8px 12px;font-size:13px;color:#52525b;border-bottom:1px solid #f4f4f5;">${fmt(c.montant)}</td>
        </tr>`,
    )
    .join('');

  const table = `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:20px 0;">
      <thead>
        <tr style="background:#fef9c3;">
          <th style="padding:10px 12px;font-size:12px;color:#a16207;text-align:left;font-weight:600;">Séance</th>
          <th style="padding:10px 12px;font-size:12px;color:#a16207;text-align:left;font-weight:600;">Montant</th>
        </tr>
      </thead>
      <tbody>${lignes}</tbody>
    </table>`;

  const html = baseTemplate({
    color,
    title: `Rappel — Cotisation en attente`,
    body: `
      ${greeting(toName)}
      ${paragraph(`Votre cotisation dans <strong>${dahiraName}</strong> est en attente de validation depuis quelques jours.`)}
      ${table}
      ${paragraph('Aucune action n\'est requise de votre part si vous avez déjà effectué votre paiement. Le secretaire_general procédera à la validation prochainement.')}
      ${paragraph('Si vous n\'avez pas encore effectué votre cotisation, nous vous invitons à le faire dès que possible.')}
      ${divider()}
      ${signOff()}
    `,
  });

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Rappel — Cotisation en attente · ${dahiraName}`,
    html,
  });

  return { success: true, messageId: info.messageId };
};

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendRecuEmail,
  sendRelanceEmail,
};

