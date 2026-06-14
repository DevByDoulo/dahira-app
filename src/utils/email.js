const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur d'email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour d'autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Envoie un email d'invitation à un membre
 * @param {string} toEmail - Email du destinataire
 * @param {string} toName - Nom du destinataire
 * @param {string} invitationLink - Lien d'invitation
 * @param {string} dahiraName - Nom du Dahira
 * @param {string} invitedBy - Nom de la personne qui invite
 */
const sendInvitationEmail = async (toEmail, toName, invitationLink, dahiraName, invitedBy) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Invitation à rejoindre ${dahiraName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌙 Invitation à rejoindre un Dahira</h1>
          </div>
          <div class="content">
            <p>Assalamu alaykum <strong>${toName}</strong>,</p>
            
            <p><strong>${invitedBy}</strong> vous invite à rejoindre <strong>${dahiraName}</strong> sur l'application de gestion Dahira.</p>
            
            <p>Pour accepter cette invitation et créer votre compte, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Accepter l'invitation</a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
              ${invitationLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Ce lien d'invitation est valide pendant <strong>7 jours</strong> et ne peut être utilisé qu'une seule fois.
            </div>
            
            <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.</p>
            
            <p>Barak Allahu fik,<br>
            L'équipe Dahira App</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email d\'invitation envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email d\'invitation');
  }
};

/**
 * Envoie un email de confirmation d'inscription
 * @param {string} toEmail - Email du destinataire
 * @param {string} toName - Nom du destinataire
 * @param {string} dahiraName - Nom du Dahira
 */
const sendWelcomeEmail = async (toEmail, toName, dahiraName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Bienvenue sur ${dahiraName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue !</h1>
          </div>
          <div class="content">
            <p>Assalamu alaykum <strong>${toName}</strong>,</p>
            
            <p>Votre compte a été créé avec succès ! Vous êtes maintenant membre de <strong>${dahiraName}</strong>.</p>
            
            <p>Vous pouvez dès maintenant vous connecter à l'application avec votre numéro de téléphone et le mot de passe que vous avez défini.</p>
            
            <p>N'hésitez pas à contacter les responsables de votre Dahira si vous avez des questions.</p>
            
            <p>Barak Allahu fik,<br>
            L'équipe Dahira App</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de bienvenue envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    // Ne pas bloquer l'inscription si l'email de bienvenue échoue
    return { success: false, error: error.message };
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
const sendPasswordResetEmail = async (toEmail, toName, resetLink) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Assalamu alaykum <strong>${toName}</strong>,</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            
            <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Ce lien est valide pendant <strong>1 heure</strong> seulement.
            </div>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel restera inchangé.</p>
            
            <p>Barak Allahu fik,<br>
            L'équipe Dahira App</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de réinitialisation envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
};

/**
 * Envoie une notification par email
 */
const sendNotificationEmail = async (toEmail, title, message, link) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3498db; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 ${title}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${link ? `
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${link}" class="button">Voir plus</a>
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};

/**
 * Envoie un reçu de cotisation par email
 */
const sendRecuEmail = async (toEmail, toName, recuNumber, pdfPath) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Dahira App'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Reçu de cotisation - ${recuNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Reçu de Cotisation</h1>
          </div>
          <div class="content">
            <p>Assalamu alaykum <strong>${toName}</strong>,</p>
            
            <p>Votre cotisation a été enregistrée avec succès.</p>
            
            <p>Vous trouverez ci-joint votre reçu de paiement (N° <strong>${recuNumber}</strong>).</p>
            
            <p>Barak Allahu fik pour votre contribution,<br>
            L'équipe Dahira App</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `${recuNumber}.pdf`,
        path: pdfPath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reçu envoyé par email:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du reçu:', error);
    throw new Error('Impossible d\'envoyer le reçu par email');
  }
};

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendRecuEmail
};
