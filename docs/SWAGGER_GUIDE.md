# 📘 Guide Swagger - Dahira App API

## 🌐 Accès à la Documentation

Une fois le serveur démarré, accédez à la documentation interactive Swagger :

```
http://localhost:3000/api-docs
```

## 🎯 Fonctionnalités Swagger UI

### 1. Interface Interactive

Swagger UI vous permet de :
- ✅ Visualiser tous les endpoints disponibles
- ✅ Tester les endpoints directement dans le navigateur
- ✅ Voir les schémas de requête/réponse
- ✅ Obtenir des exemples de code
- ✅ Filtrer les endpoints par tags

### 2. Organisation par Tags

Les endpoints sont organisés par modules :

| Tag | Description | Nombre d'Endpoints |
|-----|-------------|-------------------|
| 🔐 **Auth** | Authentification et inscription | 2 |
| 🔑 **Password Reset** | Réinitialisation mot de passe | 3 |
| ✉️ **Invitations** | Système d'invitation par email | 6 |
| 🏢 **Dahiras** | Gestion des dahiras | 7 |
| 👥 **Membres** | Gestion des membres | 8+ |
| 👤 **Users** | Gestion des utilisateurs | 6+ |
| 📊 **Dashboard** | Statistiques et graphiques | 4 |
| 🏦 **Trésorerie** | Gestion financière | 5 |
| 💰 **Cotisations** | Cotisations des membres | 8+ |
| 💸 **Dépenses** | Dépenses du dahira | 8 |
| 📅 **Séances** | Gestion des séances | 5+ |
| ✅ **Présences** | Présences aux séances | 8 |
| 🧾 **Reçus** | Reçus de cotisation | 4 |
| 🔔 **Notifications** | Système de notifications | 7 |
| 📢 **Annonces** | Annonces du dahira | 5+ |
| 🎉 **Événements** | Gestion des événements | 6+ |
| 📸 **Photos** | Gestion des photos | 5+ |

## 🔐 Authentification dans Swagger

### Étape 1 : Obtenir un Token JWT

1. Développez la section **Auth**
2. Cliquez sur `POST /api/auth/login`
3. Cliquez sur **Try it out**
4. Entrez vos identifiants :

```json
{
  "telephone": "221771234567",
  "password": "votre_mot_de_passe"
}
```

5. Cliquez sur **Execute**
6. **Copiez le token** depuis la réponse

### Étape 2 : Configurer l'Authentification

1. Cliquez sur le bouton **🔓 Authorize** en haut de la page
2. Entrez votre token dans le champ `Value` :
```
Bearer votre_token_jwt_ici
```
3. Cliquez sur **Authorize**
4. Fermez la fenêtre

✅ **Vous êtes maintenant authentifié** pour tous les endpoints protégés !

Le token sera automatiquement inclus dans toutes vos requêtes.

## 🧪 Tester un Endpoint

### Exemple : Créer un Membre

1. Développez la section **Membres**
2. Cliquez sur `POST /api/membres`
3. Cliquez sur **Try it out**
4. Modifiez le JSON d'exemple :

```json
{
  "nom": "Diallo",
  "prenom": "Amadou",
  "telephone": "221771234567",
  "email": "amadou.diallo@example.com",
  "adresse": "Dakar, Sénégal",
  "date_naissance": "1990-01-15",
  "actif": true
}
```

5. Cliquez sur **Execute**
6. Consultez la réponse :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dahira_id": 1,
    "nom": "Diallo",
    "prenom": "Amadou",
    ...
  }
}
```

## 📋 Codes de Statut HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | ✅ Succès | Données récupérées |
| 201 | ✅ Créé | Ressource créée |
| 400 | ⚠️ Erreur Client | Validation échouée |
| 401 | 🔒 Non Authentifié | Token manquant/invalide |
| 403 | 🚫 Accès Refusé | Permissions insuffisantes |
| 404 | 🔍 Non Trouvé | Ressource inexistante |
| 500 | ❌ Erreur Serveur | Erreur interne |

## 🎨 Personnalisation Swagger

### Filtrer les Endpoints

Utilisez la barre de recherche en haut pour filtrer les endpoints :
- Tapez "dashboard" pour voir uniquement les endpoints du dashboard
- Tapez "POST" pour voir uniquement les endpoints POST
- Tapez "membre" pour voir tout ce qui concerne les membres

### Schémas de Données

Cliquez sur **Schemas** en bas de la page pour voir tous les modèles de données :
- Dahira
- Membre
- User
- Cotisation
- Depense
- Seance
- Notification
- etc.

## 📖 Exemples Pratiques

### 1. Workflow Complet : Invitation → Inscription

#### a) Créer une invitation
```
POST /api/invitations
```
```json
{
  "membre_id": 1,
  "email": "nouveau@example.com",
  "role": "membre"
}
```

#### b) Vérifier l'invitation
```
GET /api/invitations/verify/{token}
```

#### c) Accepter l'invitation
```
POST /api/invitations/accept
```
```json
{
  "token": "abc123...",
  "password": "motdepasse123",
  "telephone": "221771234567"
}
```

### 2. Workflow : Gestion d'une Séance

#### a) Créer une séance
```
POST /api/seances
```
```json
{
  "type": "hebdomadaire",
  "date_seance": "2026-06-20T15:00:00Z",
  "lieu": "Mosquée centrale",
  "theme": "Lecture du Coran"
}
```

#### b) Enregistrer des présences en masse
```
POST /api/presences/batch
```
```json
{
  "seance_id": 1,
  "membre_ids": [1, 2, 3, 4, 5]
}
```

#### c) Générer la feuille de présence
```
GET /api/presences/feuille/1
```

### 3. Workflow : Gestion Financière

#### a) Consulter le solde
```
GET /api/tresorerie/solde
```

#### b) Créer une dépense
```
POST /api/depenses
```
```json
{
  "description": "Achat matériel sono",
  "montant": 150000,
  "categorie": "evenements",
  "mode_paiement": "especes",
  "date_depense": "2026-06-14"
}
```

#### c) Valider la dépense (Bureau uniquement)
```
PATCH /api/depenses/1/valider
```

#### d) Voir l'évolution de la trésorerie
```
GET /api/tresorerie/evolution?periode=mois
```

## 🔧 Paramètres de Requête

### Query Parameters

Plusieurs endpoints acceptent des paramètres de requête pour filtrer/paginer :

**Exemples :**

```
GET /api/membres?actif=true&limit=20&offset=0
GET /api/cotisations?statut=approved&mois=2026-06
GET /api/depenses?categorie=evenements&date_debut=2026-01-01
GET /api/presences/stats?seance_id=1
GET /api/dashboard/activity?limit=10
```

### Path Parameters

Les IDs sont passés dans l'URL :

```
GET /api/membres/1
PUT /api/depenses/5
DELETE /api/presences/10
PATCH /api/notifications/3/read
```

## 💡 Astuces

### 1. Persistance de l'Authentification

✅ Swagger mémorise votre token JWT entre les rechargements de page.

### 2. Voir la Durée des Requêtes

La durée d'exécution est affichée pour chaque requête (ex: 124ms).

### 3. Exporter la Collection

Téléchargez le fichier OpenAPI/Swagger JSON pour l'utiliser dans Postman ou d'autres outils :

```
http://localhost:3000/api-docs/swagger.json
```

### 4. Mode Sombre (Optionnel)

Utilisez une extension de navigateur pour activer le mode sombre sur Swagger UI.

## 📚 Documentation Complémentaire

- **README.md** - Documentation complète du projet
- **QUICK_START.md** - Guide de démarrage rapide
- **COMPLETION_SUMMARY.md** - Récapitulatif des fonctionnalités
- **postman_collection.json** - Collection Postman

## 🐛 Problèmes Courants

### Erreur 401 - Unauthorized

**Cause :** Token JWT manquant ou expiré

**Solution :**
1. Vérifiez que vous êtes authentifié (bouton Authorize)
2. Reconnectez-vous pour obtenir un nouveau token
3. Vérifiez que le token est au bon format : `Bearer <token>`

### Erreur 403 - Forbidden

**Cause :** Permissions insuffisantes pour cette action

**Solution :**
- Vérifiez votre rôle (bureau, tresorier, membre)
- Certains endpoints nécessitent le rôle "bureau" ou "tresorier"

### Erreur 404 - Not Found

**Cause :** Ressource inexistante ou mauvais dahira_id

**Solution :**
- Vérifiez que l'ID de la ressource existe
- Vérifiez que la ressource appartient à votre dahira

## 🎓 Apprentissage

### Pour les Débutants

1. Commencez par les endpoints **Auth** (login)
2. Testez les endpoints **GET** (lecture) avant les autres
3. Explorez la section **Dashboard** pour voir les données globales
4. Consultez les **Schemas** pour comprendre la structure des données

### Pour les Développeurs

1. Utilisez Swagger pour générer du code client
2. Exportez la spec OpenAPI pour vos outils
3. Consultez les exemples de réponses
4. Testez les cas d'erreur (validations, permissions)

## 🚀 Prochaines Étapes

1. ✅ Explorez tous les endpoints disponibles
2. ✅ Testez les workflows complets
3. ✅ Intégrez l'API dans votre frontend
4. ✅ Consultez les autres documentations du projet

---

**Documentation mise à jour :** Juin 2026  
**Version API :** 2.0.0

**Bon test ! 🎉**
