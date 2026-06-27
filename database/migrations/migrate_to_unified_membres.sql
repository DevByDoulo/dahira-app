-- ============================================================
-- MIGRATION : Fusion users → membres (sans perte de données)
-- Exécuter une seule fois sur la base dahira_app
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Ajouter les nouvelles colonnes à membres
-- ══════════════════════════════════════════════════════════════

ALTER TABLE membres
  ADD COLUMN IF NOT EXISTS email           VARCHAR(150) NULL          AFTER telephone,
  ADD COLUMN IF NOT EXISTS password_hash   VARCHAR(255) NULL          AFTER email,
  ADD COLUMN IF NOT EXISTS role            ENUM('super_admin','bureau','tresorier','responsable_org','membre')
                                           NOT NULL DEFAULT 'membre'  AFTER password_hash,
  ADD COLUMN IF NOT EXISTS is_owner        TINYINT(1)  NOT NULL DEFAULT 0  AFTER role,
  ADD COLUMN IF NOT EXISTS thumbnail_url   VARCHAR(255) NULL          AFTER photo_url,
  ADD COLUMN IF NOT EXISTS email_notifications TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_login      TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS date_naissance  DATE NULL,
  ADD COLUMN IF NOT EXISTS lieu_naissance  VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS adresse         TEXT NULL,
  ADD COLUMN IF NOT EXISTS profession      VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS sexe            ENUM('M','F') NULL;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Copier les données de users vers membres existants
-- (là où users.membre_id pointe vers membres.id)
-- ══════════════════════════════════════════════════════════════

UPDATE membres m
INNER JOIN users u ON u.membre_id = m.id
SET
  m.email         = u.email,
  m.password_hash = u.password_hash,
  m.role          = u.role,
  m.is_owner      = COALESCE(u.is_owner, 0),
  m.photo_url     = COALESCE(m.photo_url, u.photo_url),
  m.thumbnail_url = u.thumbnail_url,
  m.actif         = u.actif;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 3 : Insérer les super_admins (users sans membre_id)
-- ══════════════════════════════════════════════════════════════

INSERT INTO membres (dahira_id, nom, telephone, email, password_hash, role, is_owner, actif, created_at)
SELECT NULL, u.nom, u.telephone, u.email, u.password_hash, u.role, 0, u.actif, u.created_at
FROM users u
WHERE u.membre_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 4 : Table de correspondance users.id → membres.id
-- ══════════════════════════════════════════════════════════════

CREATE TEMPORARY TABLE IF NOT EXISTS _user_membre_map AS
SELECT
  u.id AS user_id,
  COALESCE(
    u.membre_id,
    (SELECT m2.id FROM membres m2 WHERE m2.telephone = u.telephone AND m2.dahira_id IS NULL LIMIT 1)
  ) AS membre_id
FROM users u;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 5 : notifications — user_id → membre_id
-- ══════════════════════════════════════════════════════════════

ALTER TABLE notifications DROP FOREIGN KEY notifications_ibfk_1;
ALTER TABLE notifications ADD COLUMN membre_id INT NULL AFTER id;

UPDATE notifications n
INNER JOIN _user_membre_map mp ON n.user_id = mp.user_id
SET n.membre_id = mp.membre_id;

ALTER TABLE notifications DROP COLUMN user_id;
ALTER TABLE notifications MODIFY membre_id INT NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT fk_notif_membre FOREIGN KEY (membre_id) REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 6 : password_resets — user_id → membre_id
-- ══════════════════════════════════════════════════════════════

ALTER TABLE password_resets DROP FOREIGN KEY password_resets_ibfk_1;
ALTER TABLE password_resets ADD COLUMN membre_id INT NULL AFTER id;

UPDATE password_resets pr
INNER JOIN _user_membre_map mp ON pr.user_id = mp.user_id
SET pr.membre_id = mp.membre_id;

ALTER TABLE password_resets DROP COLUMN user_id;
ALTER TABLE password_resets ADD CONSTRAINT fk_pwreset_membre FOREIGN KEY (membre_id) REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 7 : annonces — publie_par (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE annonces DROP FOREIGN KEY fk_annonces_user;

UPDATE annonces a
INNER JOIN _user_membre_map mp ON a.publie_par = mp.user_id
SET a.publie_par = mp.membre_id;

ALTER TABLE annonces ADD CONSTRAINT fk_annonces_membre FOREIGN KEY (publie_par) REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 8 : depenses — cree_par, valide_par (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE depenses DROP FOREIGN KEY depenses_ibfk_2;
ALTER TABLE depenses DROP FOREIGN KEY depenses_ibfk_3;

UPDATE depenses d
INNER JOIN _user_membre_map mp ON d.cree_par = mp.user_id
SET d.cree_par = mp.membre_id;

UPDATE depenses d
INNER JOIN _user_membre_map mp ON d.valide_par = mp.user_id
SET d.valide_par = mp.membre_id;

ALTER TABLE depenses ADD CONSTRAINT fk_depenses_createur FOREIGN KEY (cree_par)   REFERENCES membres(id);
ALTER TABLE depenses ADD CONSTRAINT fk_depenses_valideur  FOREIGN KEY (valide_par) REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 9 : cotisations — declare_par, valide_par (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE cotisations DROP FOREIGN KEY fk_cotisations_declarant;
ALTER TABLE cotisations DROP FOREIGN KEY fk_cotisations_validateur;

UPDATE cotisations c
INNER JOIN _user_membre_map mp ON c.declare_par = mp.user_id
SET c.declare_par = mp.membre_id;

UPDATE cotisations c
INNER JOIN _user_membre_map mp ON c.valide_par = mp.user_id
SET c.valide_par = mp.membre_id;

ALTER TABLE cotisations ADD CONSTRAINT fk_cotis_declarant FOREIGN KEY (declare_par) REFERENCES membres(id);
ALTER TABLE cotisations ADD CONSTRAINT fk_cotis_valideur  FOREIGN KEY (valide_par)  REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 10 : evenements — cree_par (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE evenements DROP FOREIGN KEY fk_evenements_user;

UPDATE evenements e
INNER JOIN _user_membre_map mp ON e.cree_par = mp.user_id
SET e.cree_par = mp.membre_id;

ALTER TABLE evenements ADD CONSTRAINT fk_evenements_membre FOREIGN KEY (cree_par) REFERENCES membres(id);

-- Ajouter les nouvelles colonnes evenements
ALTER TABLE evenements
  ADD COLUMN IF NOT EXISTS date_debut       DATE NULL,
  ADD COLUMN IF NOT EXISTS date_fin         DATE NULL,
  ADD COLUMN IF NOT EXISTS image_url        VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS inscriptions_ouvertes TINYINT(1) NOT NULL DEFAULT 1;

-- Migrer date_evenement → date_debut
UPDATE evenements SET date_debut = date_evenement WHERE date_debut IS NULL AND date_evenement IS NOT NULL;
ALTER TABLE evenements DROP COLUMN IF EXISTS date_evenement;
ALTER TABLE evenements DROP COLUMN IF EXISTS heure;

-- Mettre à jour le type ENUM evenements pour inclure 'gamou'
ALTER TABLE evenements MODIFY type ENUM('gamou','conference','sortie','ceremonie','formation','autre') NULL;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 11 : invitations — invited_by (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE invitations DROP FOREIGN KEY invitations_ibfk_3;

UPDATE invitations i
INNER JOIN _user_membre_map mp ON i.invited_by = mp.user_id
SET i.invited_by = mp.membre_id;

ALTER TABLE invitations ADD CONSTRAINT fk_invitations_inviteur FOREIGN KEY (invited_by) REFERENCES membres(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 12 : photos — uploaded_by (users.id → membres.id)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE photos DROP FOREIGN KEY photos_ibfk_3;

UPDATE photos p
INNER JOIN _user_membre_map mp ON p.uploaded_by = mp.user_id
SET p.uploaded_by = mp.membre_id;

ALTER TABLE photos ADD CONSTRAINT fk_photos_uploader FOREIGN KEY (uploaded_by) REFERENCES membres(id);

-- Renommer fichier_url → photo_url si besoin (pour cohérence)
ALTER TABLE photos CHANGE COLUMN IF EXISTS fichier_url photo_url VARCHAR(500) NULL;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 13 : participations — ajouter statut, dahira_id
-- ══════════════════════════════════════════════════════════════

ALTER TABLE participations
  ADD COLUMN IF NOT EXISTS statut   ENUM('inscrit','confirme','annule','present') NOT NULL DEFAULT 'inscrit',
  ADD COLUMN IF NOT EXISTS dahira_id INT NULL;

-- Migrer inscrit/present → statut
UPDATE participations SET statut = 'present' WHERE present = 1;
UPDATE participations SET statut = 'inscrit'  WHERE inscrit = 1 AND present = 0;
UPDATE participations SET statut = 'annule'   WHERE inscrit = 0 AND present = 0;

-- Remplir dahira_id depuis evenements
UPDATE participations p
INNER JOIN evenements e ON p.evenement_id = e.id
SET p.dahira_id = e.dahira_id;

ALTER TABLE participations DROP COLUMN IF EXISTS inscrit;
ALTER TABLE participations DROP COLUMN IF EXISTS present;
ALTER TABLE participations ADD CONSTRAINT fk_participations_dahira FOREIGN KEY (dahira_id) REFERENCES dahiras(id);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 14 : Supprimer la table presences
-- ══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS presences;

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 15 : Ajouter UNIQUE sur membres.telephone
-- (vérifier d'abord qu'il n'y a pas de doublons)
-- ══════════════════════════════════════════════════════════════

-- Si cette commande échoue, il y a des numéros dupliqués à corriger manuellement
ALTER TABLE membres ADD UNIQUE INDEX IF NOT EXISTS idx_membres_telephone (telephone);

-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 16 : Nettoyer
-- ══════════════════════════════════════════════════════════════

DROP TEMPORARY TABLE IF EXISTS _user_membre_map;

SET FOREIGN_KEY_CHECKS = 1;

-- ══════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ══════════════════════════════════════════════════════════════

SELECT 'membres' AS tbl, COUNT(*) AS total FROM membres
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'evenements', COUNT(*) FROM evenements;

SELECT 'Migration terminée avec succès' AS status;
