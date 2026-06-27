-- Migration : ajout du rôle responsable_org
ALTER TABLE users
  MODIFY COLUMN role ENUM('bureau', 'tresorier', 'responsable_org', 'membre') DEFAULT 'membre';

ALTER TABLE invitations
  MODIFY COLUMN role ENUM('bureau', 'tresorier', 'responsable_org', 'membre') DEFAULT 'membre';
