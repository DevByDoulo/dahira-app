const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dahira App API',
      version: '2.0.0',
      description: `
# 🕌 API de Gestion de Dahira

Application complète de gestion pour les dahiras (organisations religieuses).

## 🎯 Fonctionnalités Principales

### 👥 Gestion des Membres
- CRUD complet des membres
- Photos de profil
- Statistiques de présence

### 💰 Gestion Financière
- **Cotisations** : enregistrement, validation, suivi mensuel
- **Dépenses** : création, validation secretaire_general, catégorisation
- **Trésorerie** : solde en temps réel, historique, prévisions
- **Reçus** : génération automatique PDF

### 📊 Dashboard & Statistiques
- Statistiques globales (membres, finances, séances)
- Graphiques d'évolution
- Activité récente
- Comparaisons mensuelles

### 📅 Séances & Présences
- Gestion des séances (hebdomadaires, mensuelles, spéciales)
- Enregistrement des présences (individuel et masse)
- Feuilles de présence
- Statistiques d'assiduité

### 🔔 Communication
- **Notifications** : email, in-app, rappels automatiques
- **Annonces** : info, important, urgent
- **Événements** : avec gestion des inscriptions

### 🔐 Sécurité & Authentification
- JWT authentication
- Réinitialisation mot de passe par email
- Système d'invitations sécurisées
- Gestion des rôles (secretaire_general, Trésorier, Membre)

### 🏢 Multi-Tenant
- Isolation complète par dahira
- Gestion de plusieurs dahiras
- Sécurité multi-tenant intégrée

## 🚀 Démarrage Rapide

1. **Authentification** : Utilisez \`POST /api/auth/login\` pour obtenir un token JWT
2. **Authorization Header** : Ajoutez le token dans vos requêtes : \`Bearer <token>\`
3. **Tester** : Utilisez "Try it out" sur chaque endpoint

## 📚 Documentation Complète

Consultez le README.md du projet pour plus de détails.

## 🔑 Rôles et Permissions

- **secretaire_general** : Accès complet à toutes les fonctionnalités
- **Trésorier** : Gestion financière (cotisations, dépenses, trésorerie)
- **Membre** : Consultation des données uniquement
      `,
      contact: {
        name: 'Support Dahira App',
        email: 'support@dahira-app.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.dahira-app.com',
        description: 'Serveur de production'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentification et inscription'
      },
      {
        name: 'Password Reset',
        description: 'Réinitialisation de mot de passe'
      },
      {
        name: 'Invitations',
        description: 'Système d\'invitation par email'
      },
      {
        name: 'Dahiras',
        description: 'Gestion des dahiras (multi-tenant)'
      },
      {
        name: 'Membres',
        description: 'Gestion des membres du dahira'
      },
      {
        name: 'Users',
        description: 'Gestion des comptes utilisateurs'
      },
      {
        name: 'Dashboard',
        description: 'Statistiques et graphiques du tableau de bord'
      },
      {
        name: 'Trésorerie',
        description: 'Gestion de la trésorerie (solde, transactions, prévisions)'
      },
      {
        name: 'Cotisations',
        description: 'Gestion des cotisations des membres'
      },
      {
        name: 'Dépenses',
        description: 'Gestion des dépenses du dahira'
      },
      {
        name: 'Séances',
        description: 'Gestion des séances (hebdomadaires, mensuelles, spéciales)'
      },
      {
        name: 'Présences',
        description: 'Gestion des présences aux séances'
      },
      {
        name: 'Reçus',
        description: 'Génération et envoi de reçus de cotisation'
      },
      {
        name: 'Notifications',
        description: 'Système de notifications email et in-app'
      },
      {
        name: 'Annonces',
        description: 'Gestion des annonces du dahira'
      },
      {
        name: 'Événements',
        description: 'Gestion des événements et inscriptions'
      },
      {
        name: 'Photos',
        description: 'Gestion des photos (profils, galerie)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT obtenu via /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Données de la réponse'
            }
          }
        },
        Dahira: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nom: {
              type: 'string',
              example: 'Dahira Touba'
            },
            adresse: {
              type: 'string',
              example: '10 Rue de la Paix, Dakar'
            },
            telephone: {
              type: 'string',
              example: '221771234567'
            },
            email: {
              type: 'string',
              example: 'contact@dahira-touba.sn'
            },
            description: {
              type: 'string'
            },
            logo_url: {
              type: 'string'
            },
            actif: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Membre: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            dahira_id: {
              type: 'integer'
            },
            nom: {
              type: 'string',
              example: 'Diallo'
            },
            prenom: {
              type: 'string',
              example: 'Amadou'
            },
            telephone: {
              type: 'string',
              example: '221771234567'
            },
            email: {
              type: 'string',
              example: 'amadou.diallo@example.com'
            },
            photo_url: {
              type: 'string'
            },
            actif: {
              type: 'boolean',
              example: true
            },
            responsabilite: {
              type: 'string',
              example: 'Secrétaire'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            dahira_id: {
              type: 'integer'
            },
            membre_id: {
              type: 'integer'
            },
            nom: {
              type: 'string'
            },
            telephone: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['secretaire_general', 'tresorier', 'membre'],
              example: 'membre'
            },
            actif: {
              type: 'boolean',
              example: true
            }
          }
        },
        Cotisation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            dahira_id: {
              type: 'integer'
            },
            membre_id: {
              type: 'integer'
            },
            montant: {
              type: 'number',
              example: 5000
            },
            mode_paiement: {
              type: 'string',
              enum: ['especes', 'wave', 'orange_money', 'virement'],
              example: 'especes'
            },
            mois_concerne: {
              type: 'string',
              example: '2026-06'
            },
            statut: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              example: 'approved'
            }
          }
        },
        Depense: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            dahira_id: {
              type: 'integer'
            },
            description: {
              type: 'string',
              example: 'Achat de matériel sono'
            },
            montant: {
              type: 'number',
              example: 150000
            },
            categorie: {
              type: 'string',
              enum: ['evenements', 'location', 'nourriture', 'donations', 'maintenance', 'autres'],
              example: 'evenements'
            },
            mode_paiement: {
              type: 'string',
              enum: ['especes', 'wave', 'orange_money', 'virement', 'cheque'],
              example: 'especes'
            },
            date_depense: {
              type: 'string',
              format: 'date',
              example: '2026-06-14'
            },
            statut: {
              type: 'string',
              enum: ['en_attente', 'validee', 'rejetee'],
              example: 'en_attente'
            }
          }
        },
        Seance: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            dahira_id: {
              type: 'integer'
            },
            type: {
              type: 'string',
              enum: ['hebdomadaire', 'mensuelle', 'speciale', 'assemblee_generale'],
              example: 'hebdomadaire'
            },
            date_seance: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-20T15:00:00Z'
            },
            lieu: {
              type: 'string',
              example: 'Mosquée centrale'
            },
            theme: {
              type: 'string'
            },
            cloturee: {
              type: 'boolean',
              example: false
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            user_id: {
              type: 'integer'
            },
            type: {
              type: 'string',
              example: 'nouvelle_annonce'
            },
            title: {
              type: 'string',
              example: 'Nouvelle annonce'
            },
            message: {
              type: 'string',
              example: 'Une nouvelle annonce a été publiée'
            },
            is_read: {
              type: 'boolean',
              example: false
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token JWT manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Token manquant ou invalide'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès refusé - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Accès refusé'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Ressource non trouvée'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Erreur de validation'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/modules/**/*.routes.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;

