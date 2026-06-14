# 📧 Configuration Gmail pour les Invitations

## Guide Pas-à-Pas pour Gmail

### Étape 1 : Activer la Validation en 2 Étapes

1. Allez sur https://myaccount.google.com/security
2. Cherchez "Validation en 2 étapes"
3. Cliquez sur "Activer"
4. Suivez les instructions (généralement SMS)

### Étape 2 : Créer un Mot de Passe d'Application

1. Restez sur https://myaccount.google.com/security
2. Cherchez "Mots de passe des applications"
   - Si vous ne voyez pas cette option, vérifiez que la validation en 2 étapes est bien activée
3. Cliquez sur "Mots de passe des applications"
4. Dans le menu déroulant, sélectionnez :
   - **Sélectionner l'application** : "Autre (nom personnalisé)"
   - Tapez : "Dahira App" ou "Application Dahira"
5. Cliquez sur "Générer"
6. Google affiche un mot de passe de 16 caractères (format : xxxx xxxx xxxx xxxx)
7. **Copiez ce mot de passe** - vous ne pourrez plus le revoir !

### Étape 3 : Configurer le Fichier .env

Créez ou éditez votre fichier `.env` :

```env
# Configuration SMTP Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=Dahira App
SMTP_FROM_EMAIL=noreply@dahira-app.com

FRONTEND_URL=http://localhost:3000
```

**Important :**
- `SMTP_USER` : Votre adresse Gmail complète
- `SMTP_PASS` : Le mot de passe d'application de 16 caractères (avec ou sans espaces)
- `SMTP_PORT` : 587 (TLS) ou 465 (SSL)
- `SMTP_SECURE` : false pour 587, true pour 465

### Étape 4 : Tester la Configuration

```bash
node test-email.js votre.email@gmail.com
```

Si tout est OK, vous verrez :
```
✅ Email envoyé avec succès!
Message ID: <xyz@gmail.com>

Vérifiez votre boîte mail: votre.email@gmail.com
```

## 🔧 Configuration Alternative (Sans Validation 2 Étapes)

**⚠️ Non recommandé - Moins sécurisé**

Si vous ne voulez pas activer la validation en 2 étapes :

1. Allez sur https://myaccount.google.com/security
2. Cherchez "Accès moins sécurisé des applications"
3. Activez "Autoriser les applications moins sécurisées"

Puis dans `.env` :
```env
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_gmail_normal
```

**Attention :** Gmail peut bloquer cette méthode sans préavis.

## 📊 Limites Gmail

| Limite | Valeur |
|--------|--------|
| Emails par jour | 500 |
| Destinataires par email | 500 |
| Emails par heure | ~100 |

**Recommandation :** Pour production, utilisez SendGrid, Mailgun ou AWS SES.

## 🐛 Dépannage

### Erreur : "Invalid login"

**Causes possibles :**
1. Mot de passe d'application incorrect
2. Validation en 2 étapes non activée
3. Compte Gmail récent (attendre 24h)

**Solutions :**
1. Régénérer un nouveau mot de passe d'application
2. Vérifier que `SMTP_USER` correspond au compte Gmail
3. Copier-coller le mot de passe (pas d'espaces au début/fin)

### Erreur : "EAUTH authentication failed"

**Solutions :**
1. Vérifier que la validation en 2 étapes est activée
2. Créer un nouveau mot de passe d'application
3. Désactiver puis réactiver l'accès moins sécurisé (si utilisé)

### Erreur : "Connection timeout"

**Causes possibles :**
1. Pare-feu bloque le port 587
2. Antivirus bloque la connexion
3. Problème réseau

**Solutions :**
1. Essayer le port 465 avec `SMTP_SECURE=true`
2. Désactiver temporairement l'antivirus
3. Vérifier la connexion internet

### Erreur : "Recipient address rejected"

**Cause :** Compte Gmail nouveau ou non vérifié

**Solution :** Attendre 24-48h après création du compte

### Email dans spam

**Solutions :**
1. Ajouter l'expéditeur aux contacts
2. Configurer SPF record (domaine personnalisé)
3. Utiliser un service SMTP professionnel

## 🔐 Sécurité

### ✅ Bonnes Pratiques

- Utiliser un mot de passe d'application (pas votre mot de passe Gmail)
- Ne jamais commit le fichier `.env`
- Révoquer les mots de passe non utilisés
- Créer un compte Gmail dédié pour l'application
- Monitorer l'activité du compte

### ❌ À Éviter

- Utiliser votre compte Gmail personnel
- Partager le mot de passe d'application
- Désactiver la validation en 2 étapes
- Commit `.env` dans Git
- Utiliser "Accès moins sécurisé"

## 🚀 Migration vers Service Professionnel

Quand vous êtes prêt pour la production :

### SendGrid (Recommandé)

**Avantages :**
- 100 emails/jour gratuits
- 40,000+ emails payants
- Excellent deliverability
- Dashboard analytics

**Configuration :**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
```

**Obtenir une clé :**
1. Créer compte sur https://sendgrid.com
2. Settings → API Keys
3. Create API Key
4. Copier la clé

### Mailgun

**Avantages :**
- 5,000 emails/mois gratuits
- API puissante
- Webhooks

**Configuration :**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre_password_mailgun
```

### AWS SES

**Avantages :**
- Très économique (0.10$/1000 emails)
- Excellente scalabilité
- Intégration AWS

**Configuration :**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre_access_key
SMTP_PASS=votre_secret_key
```

## 📝 Checklist de Configuration

- [ ] Compte Gmail créé/sélectionné
- [ ] Validation en 2 étapes activée
- [ ] Mot de passe d'application généré
- [ ] Fichier `.env` configuré
- [ ] Test email réussi
- [ ] `.env` ajouté à `.gitignore`
- [ ] Email de test reçu (pas dans spam)

## 💡 Astuces

### Pour le Développement

1. **Compte Gmail Dédié**
   - Créez un compte Gmail spécifique pour l'application
   - Nom : dahira.app.dev@gmail.com
   - Séparé de vos comptes personnels

2. **Tester sans Envoyer**
   - Utilisez Mailtrap.io pour intercepter les emails
   - Pas d'envoi réel, juste des tests

3. **Variables Multiples**
   - `.env.development` pour Gmail
   - `.env.production` pour SendGrid

### Pour la Production

1. **Domaine Personnalisé**
   - Configurez SPF, DKIM, DMARC
   - Améliore le deliverability

2. **Monitoring**
   - Surveillez les bounces
   - Alertes sur taux d'échec élevé

3. **Backup SMTP**
   - Configurez un provider de secours
   - Basculement automatique

## 📞 Support Gmail

Si vous rencontrez des problèmes :

1. **Centre d'aide Gmail :** https://support.google.com/mail
2. **Status Google :** https://www.google.com/appsstatus
3. **Communauté Gmail :** https://support.google.com/mail/community

## 🔗 Liens Utiles

- [Mot de passe d'application](https://support.google.com/accounts/answer/185833)
- [Validation en 2 étapes](https://support.google.com/accounts/answer/185839)
- [Limites Gmail](https://support.google.com/a/answer/166852)
- [Nodemailer Gmail](https://nodemailer.com/usage/using-gmail/)
