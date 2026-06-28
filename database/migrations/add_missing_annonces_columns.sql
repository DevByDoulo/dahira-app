ALTER TABLE annonces
  ADD COLUMN IF NOT EXISTS image_url    VARCHAR(500) NULL        AFTER contenu,
  ADD COLUMN IF NOT EXISTS cible_groupe VARCHAR(50)  DEFAULT 'tous' AFTER image_url,
  ADD COLUMN IF NOT EXISTS epinglee     BOOLEAN      DEFAULT FALSE  AFTER cible_groupe;
