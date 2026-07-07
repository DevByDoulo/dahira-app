const ROLES = {
  SUPER_ADMIN:        'super_admin',
  SECRETAIRE_GENERAL: 'secretaire_general',
  ADJOINT:            'adjoint',
  TRESORIER:          'tresorier',
  RESPONSABLE_ORG:    'responsable_org',
  MEMBRE:             'membre'
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: {
    fr: 'Super Administrateur',
    en: 'Super Admin',
    level: 99,
    description: 'Contrôle total de la plateforme SaaS — tous les dahiras'
  },
  [ROLES.SECRETAIRE_GENERAL]: {
    fr: 'Secrétaire Général',
    en: 'Secretary General',
    level: 5,
    description: 'Admin du dahira — accès complet, peut gérer les adjoints'
  },
  [ROLES.ADJOINT]: {
    fr: 'Adjoint',
    en: 'Deputy',
    level: 4,
    description: 'Mêmes droits que le SG sauf désactiver/supprimer le SG'
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
    description: 'Gestion des séances et de l\'organisation'
  },
  [ROLES.MEMBRE]: {
    fr: 'Membre',
    en: 'Member',
    level: 1,
    description: 'Accès en lecture — profil, cotisations propres, calendrier'
  }
};

const ROLE_HIERARCHY = [
  ROLES.MEMBRE,
  ROLES.RESPONSABLE_ORG,
  ROLES.TRESORIER,
  ROLES.ADJOINT,
  ROLES.SECRETAIRE_GENERAL,
];

// Rôles avec droits d'administration du dahira
const ADMIN_ROLES = [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT];

const PERMISSIONS = {
  'dahiras.view':    [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE],
  'dahiras.create':  [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'dahiras.update':  [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'dahiras.delete':  [ROLES.SECRETAIRE_GENERAL],

  'membres.view':         [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE],
  'membres.create':       [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'membres.update':       [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'membres.delete':       [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'membres.upload_photo': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],

  'users.view':        [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'users.create':      [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'users.update':      [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'users.change_role': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'users.delete':      [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],

  'cotisations.view_all': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'cotisations.view_own': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE],
  'cotisations.create':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'cotisations.validate': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'cotisations.reject':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],

  'depenses.view':     [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'depenses.create':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'depenses.update':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'depenses.validate': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'depenses.reject':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],
  'depenses.delete':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],

  'tresorerie.view':  [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'tresorerie.stats': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],

  'seances.view':   [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE],
  'seances.create': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'seances.update': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'seances.delete': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT],

  'dashboard.view':  [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE],
  'dashboard.stats': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],

  'invitations.create': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'invitations.cancel': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
  'invitations.resend': [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER],
};

const isAtLeast = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userLevel === -1 || requiredLevel === -1) return false;
  return userLevel >= requiredLevel;
};

const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) { console.warn(`Permission inconnue: ${permission}`); return false; }
  return allowedRoles.includes(userRole);
};

const isAdminRole = (role) => ADMIN_ROLES.includes(role);

const getAllRoles = () => Object.values(ROLES);
const isValidRole = (role) => getAllRoles().includes(role);
const getRoleInfo = (role) => ROLE_LABELS[role] || null;
const getRoleLevel = (role) => { const info = getRoleInfo(role); return info ? info.level : 0; };
const compareRoles = (role1, role2) => getRoleLevel(role1) - getRoleLevel(role2);
const getRolePermissions = (role) =>
  Object.entries(PERMISSIONS).filter(([, roles]) => roles.includes(role)).map(([p]) => p);

module.exports = {
  ROLES, ROLE_LABELS, ROLE_HIERARCHY, PERMISSIONS, ADMIN_ROLES,
  isAtLeast, hasPermission, isAdminRole,
  getAllRoles, isValidRole, getRoleInfo, getRoleLevel, compareRoles, getRolePermissions,
};
