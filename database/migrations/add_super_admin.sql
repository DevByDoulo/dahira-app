-- Migration : ajout du rôle super_admin et dahira_id nullable
-- Exécuter AVANT le script seeds/create-super-admin.js

-- 1. Rendre dahira_id nullable (le super_admin n'appartient à aucun dahira)
ALTER TABLE users
  MODIFY COLUMN dahira_id INT NULL;

-- 2. Ajouter super_admin à l'ENUM des rôles utilisateurs
ALTER TABLE users
  MODIFY COLUMN role ENUM('super_admin', 'bureau', 'tresorier', 'responsable_org', 'membre') DEFAULT 'membre';

-- 3. Le rôle invitation reste inchangé (on n'invite pas un super_admin via ce flux)
ALTER TABLE invitations
  MODIFY COLUMN role ENUM('bureau', 'tresorier', 'responsable_org', 'membre') DEFAULT 'membre';
