-- Migration : ajout des colonnes manquantes dans la table dahiras
ALTER TABLE dahiras
  ADD COLUMN IF NOT EXISTS email       VARCHAR(255) NULL AFTER telephone,
  ADD COLUMN IF NOT EXISTS description TEXT         NULL AFTER email,
  ADD COLUMN IF NOT EXISTS logo_url    VARCHAR(500) NULL AFTER description,
  ADD COLUMN IF NOT EXISTS actif       BOOLEAN      NOT NULL DEFAULT TRUE AFTER logo_url;
