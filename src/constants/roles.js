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
    description: 'Accès minimal — profil et déclaration de ses cotisations'
  }
};

// Rôles avec droits d'administration du dahira
const ADMIN_ROLES = [ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT];

// La source de vérité des autorisations est dans les routes de chaque module,
// via allowRoles(...) (middlewares/role.middleware.js) avec des listes explicites.

const isAdminRole = (role) => ADMIN_ROLES.includes(role);

const getAllRoles = () => Object.values(ROLES);
const isValidRole = (role) => getAllRoles().includes(role);
const getRoleInfo = (role) => ROLE_LABELS[role] || null;
const getRoleLevel = (role) => { const info = getRoleInfo(role); return info ? info.level : 0; };
const compareRoles = (role1, role2) => getRoleLevel(role1) - getRoleLevel(role2);

module.exports = {
  ROLES, ROLE_LABELS, ADMIN_ROLES,
  isAdminRole,
  getAllRoles, isValidRole, getRoleInfo, getRoleLevel, compareRoles,
};
