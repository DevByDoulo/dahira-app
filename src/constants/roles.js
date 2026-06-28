/**
 * Constantes pour les rôles utilisateurs
 * 
 * Utilisation :
 * - Import : const { ROLES, ROLE_LABELS, isAtLeast, hasPermission } = require('../constants/roles');
 * - Middleware : allowRoles(ROLES.BUREAU, ROLES.TRESORIER)
 * - Conditions : if (user.role === ROLES.BUREAU) { ... }
 */

// ============================================
// DÉFINITION DES RÔLES
// ============================================

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BUREAU: 'bureau',
  TRESORIER: 'tresorier',
  RESPONSABLE_ORG: 'responsable_org',
  MEMBRE: 'membre'
};

// ============================================
// LABELS ET MÉTADONNÉES DES RÔLES
// ============================================

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: {
    fr: 'Super Administrateur',
    en: 'Super Admin',
    level: 99,
    description: 'Contrôle total de la plateforme SaaS — tous les dahiras'
  },
  [ROLES.BUREAU]: {
    fr: 'Administrateur Général',
    en: 'Admin',
    level: 4,
    description: 'Accès complet — configuration et gestion globale'
  },
  [ROLES.TRESORIER]: {
    fr: 'Trésorier',
    en: 'Treasurer',
    level: 3,
    description: 'Gestion financière — cotisations, dépenses, rapports'
  },
  [ROLES.RESPONSABLE_ORG]: {
    fr: 'Communicateur',
    en: 'Communicator',
    level: 2,
    description: 'Gestion des annonces, événements et séances'
  },
  [ROLES.MEMBRE]: {
    fr: 'Membre',
    en: 'Member',
    level: 1,
    description: 'Accès en lecture — profil, cotisations propres, calendrier'
  }
};

// ============================================
// HIÉRARCHIE DES RÔLES
// ============================================

const ROLE_HIERARCHY = [
  ROLES.MEMBRE,           // Niveau 1
  ROLES.RESPONSABLE_ORG,  // Niveau 2
  ROLES.TRESORIER,        // Niveau 3
  ROLES.BUREAU            // Niveau 4 - Toutes les permissions
];

// ============================================
// PERMISSIONS PAR RÔLE
// ============================================

const PERMISSIONS = {
  // Gestion des dahiras
  'dahiras.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'dahiras.create': [ROLES.BUREAU],
  'dahiras.update': [ROLES.BUREAU],
  'dahiras.delete': [ROLES.BUREAU],

  // Gestion des membres
  'membres.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'membres.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'membres.update': [ROLES.BUREAU, ROLES.TRESORIER],
  'membres.delete': [ROLES.BUREAU],
  'membres.upload_photo': [ROLES.BUREAU, ROLES.TRESORIER],

  // Gestion des utilisateurs
  'users.view': [ROLES.BUREAU, ROLES.TRESORIER],
  'users.create': [ROLES.BUREAU],
  'users.update': [ROLES.BUREAU],
  'users.change_role': [ROLES.BUREAU],
  'users.delete': [ROLES.BUREAU],

  // Cotisations
  'cotisations.view_all': [ROLES.BUREAU, ROLES.TRESORIER],
  'cotisations.view_own': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'cotisations.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'cotisations.validate': [ROLES.BUREAU, ROLES.TRESORIER],
  'cotisations.reject': [ROLES.BUREAU, ROLES.TRESORIER],

  // Dépenses
  'depenses.view': [ROLES.BUREAU, ROLES.TRESORIER],
  'depenses.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'depenses.update': [ROLES.BUREAU, ROLES.TRESORIER],
  'depenses.validate': [ROLES.BUREAU], // Seul le Bureau peut valider
  'depenses.reject': [ROLES.BUREAU],   // Seul le Bureau peut rejeter
  'depenses.delete': [ROLES.BUREAU],

  // Trésorerie
  'tresorerie.view': [ROLES.BUREAU, ROLES.TRESORIER],
  'tresorerie.stats': [ROLES.BUREAU, ROLES.TRESORIER],

  // Séances
  'seances.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'seances.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'seances.update': [ROLES.BUREAU, ROLES.TRESORIER],
  'seances.delete': [ROLES.BUREAU],

  // Présences
  'presences.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'presences.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'presences.update': [ROLES.BUREAU, ROLES.TRESORIER],
  'presences.delete': [ROLES.BUREAU, ROLES.TRESORIER],

  // Reçus
  'recus.generate': [ROLES.BUREAU, ROLES.TRESORIER],
  'recus.send': [ROLES.BUREAU, ROLES.TRESORIER],
  'recus.view_own': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],

  // Notifications
  'notifications.view_own': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'notifications.send_all': [ROLES.BUREAU],
  'notifications.send_reminders': [ROLES.BUREAU, ROLES.TRESORIER],

  // Annonces
  'annonces.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'annonces.create': [ROLES.BUREAU],
  'annonces.update': [ROLES.BUREAU],
  'annonces.delete': [ROLES.BUREAU],

  // Événements
  'evenements.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'evenements.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'evenements.update': [ROLES.BUREAU, ROLES.TRESORIER],
  'evenements.delete': [ROLES.BUREAU],
  'evenements.register': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],

  // Dashboard
  'dashboard.view': [ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE],
  'dashboard.stats': [ROLES.BUREAU, ROLES.TRESORIER],

  // Invitations
  'invitations.create': [ROLES.BUREAU, ROLES.TRESORIER],
  'invitations.cancel': [ROLES.BUREAU, ROLES.TRESORIER],
  'invitations.resend': [ROLES.BUREAU, ROLES.TRESORIER]
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si un rôle a au moins le niveau d'un autre rôle
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} requiredRole - Rôle requis minimum
 * @returns {boolean}
 * 
 * @example
 * isAtLeast('bureau', 'tresorier') // true
 * isAtLeast('membre', 'tresorier') // false
 */
const isAtLeast = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  
  if (userLevel === -1 || requiredLevel === -1) {
    return false;
  }
  
  return userLevel >= requiredLevel;
};

/**
 * Vérifie si un rôle a une permission spécifique
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 * 
 * @example
 * hasPermission('tresorier', 'depenses.create') // true
 * hasPermission('membre', 'depenses.create')    // false
 */
const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  
  if (!allowedRoles) {
    console.warn(`Permission inconnue: ${permission}`);
    return false;
  }
  
  return allowedRoles.includes(userRole);
};

/**
 * Retourne tous les rôles valides
 * @returns {string[]}
 */
const getAllRoles = () => {
  return Object.values(ROLES);
};

/**
 * Vérifie si une valeur est un rôle valide
 * @param {string} role - Valeur à vérifier
 * @returns {boolean}
 * 
 * @example
 * isValidRole('bureau')    // true
 * isValidRole('invalid')   // false
 */
const isValidRole = (role) => {
  return getAllRoles().includes(role);
};

/**
 * Retourne les informations d'un rôle
 * @param {string} role - Rôle à rechercher
 * @returns {object|null}
 * 
 * @example
 * getRoleInfo('bureau')
 * // { fr: 'Bureau', en: 'Board', icon: '🏛️', level: 3, ... }
 */
const getRoleInfo = (role) => {
  return ROLE_LABELS[role] || null;
};

/**
 * Retourne le niveau hiérarchique d'un rôle
 * @param {string} role - Rôle
 * @returns {number} - Niveau (1-3) ou 0 si invalide
 */
const getRoleLevel = (role) => {
  const info = getRoleInfo(role);
  return info ? info.level : 0;
};

/**
 * Compare deux rôles
 * @param {string} role1 
 * @param {string} role2 
 * @returns {number} - Négatif si role1 < role2, positif si role1 > role2, 0 si égaux
 */
const compareRoles = (role1, role2) => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  return level1 - level2;
};

/**
 * Retourne toutes les permissions d'un rôle
 * @param {string} role - Rôle
 * @returns {string[]} - Liste des permissions
 */
const getRolePermissions = (role) => {
  return Object.entries(PERMISSIONS)
    .filter(([permission, roles]) => roles.includes(role))
    .map(([permission]) => permission);
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Constantes
  ROLES,
  ROLE_LABELS,
  ROLE_HIERARCHY,
  PERMISSIONS,
  
  // Fonctions utilitaires
  isAtLeast,
  hasPermission,
  getAllRoles,
  isValidRole,
  getRoleInfo,
  getRoleLevel,
  compareRoles,
  getRolePermissions
};
