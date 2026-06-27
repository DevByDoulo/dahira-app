-- Marque le créateur/propriétaire principal d'un Dahira
ALTER TABLE users ADD COLUMN is_owner BOOLEAN NOT NULL DEFAULT FALSE;
