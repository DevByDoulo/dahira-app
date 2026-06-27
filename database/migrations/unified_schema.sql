-- =====================================================
-- Schéma unifié — membres absorbe users, suppression presences
-- À exécuter sur une base vide (DROP + recreate)
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS presences;
DROP TABLE IF EXISTS participations;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS recus;
DROP TABLE IF EXISTS depenses;
DROP TABLE IF EXISTS annonces;
DROP TABLE IF EXISTS evenements;
DROP TABLE IF EXISTS cotisations;
DROP TABLE IF EXISTS seances;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS membres;
DROP TABLE IF EXISTS dahiras;

SET FOREIGN_KEY_CHECKS = 1;

-- ── dahiras ───────────────────────────────────────────
CREATE TABLE dahiras (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nom         VARCHAR(255) NOT NULL,
  ville       VARCHAR(100) NULL,
  adresse     TEXT NULL,
  telephone   VARCHAR(20) NULL,
  email       VARCHAR(255) NULL,
  description TEXT NULL,
  logo_url    VARCHAR(500) NULL,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── membres (unifié : registre + comptes) ────────────
CREATE TABLE membres (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id           INT NULL,  -- NULL pour super_admin global

  -- Identité
  nom                 VARCHAR(255) NOT NULL,
  prenom              VARCHAR(100) NULL,
  telephone           VARCHAR(20) UNIQUE NOT NULL,
  email               VARCHAR(255) NULL,
  date_naissance      DATE NULL,
  lieu_naissance      VARCHAR(255) NULL,
  adresse             TEXT NULL,
  profession          VARCHAR(255) NULL,
  responsabilites     VARCHAR(255) NULL,
  telephone_secours   VARCHAR(20) NULL,
  date_adhesion       DATE NULL,
  sexe                ENUM('M','F') NULL,

  -- Compte (NULL = membre sans accès à l'app)
  password_hash       VARCHAR(255) NULL,
  role                ENUM('super_admin','bureau','tresorier','responsable_org','membre') NOT NULL DEFAULT 'membre',
  is_owner            BOOLEAN NOT NULL DEFAULT FALSE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,

  -- Médias
  photo_url           VARCHAR(500) NULL,
  thumbnail_url       VARCHAR(500) NULL,

  -- Statut
  actif               BOOLEAN NOT NULL DEFAULT TRUE,
  last_login          TIMESTAMP NULL,

  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  INDEX idx_dahira_actif  (dahira_id, actif) USING BTREE,
  INDEX idx_telephone     (telephone),
  INDEX idx_dahira_role   (dahira_id, role),
  INDEX idx_nom           (nom),
  UNIQUE KEY unique_email_per_dahira (dahira_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── seances ───────────────────────────────────────────
CREATE TABLE seances (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id    INT NOT NULL,
  type         ENUM('hebdomadaire','mensuelle','speciale','assemblee_generale') DEFAULT 'hebdomadaire',
  date_seance  DATETIME NOT NULL,
  heure_debut  TIME NULL,
  heure_fin    TIME NULL,
  lieu         VARCHAR(255) NULL,
  theme        VARCHAR(255) NULL,
  description  TEXT NULL,
  cloturee     BOOLEAN DEFAULT FALSE,
  rappel_envoye BOOLEAN DEFAULT FALSE,
  created_by   INT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)  REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES membres(id)  ON DELETE SET NULL,
  INDEX idx_dahira_date (dahira_id, date_seance),
  INDEX idx_type        (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── cotisations ───────────────────────────────────────
CREATE TABLE cotisations (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id       INT NOT NULL,
  membre_id       INT NOT NULL,
  seance_id       INT NULL,
  montant         DECIMAL(10,2) NOT NULL,
  mode_paiement   ENUM('especes','wave','orange_money','virement') DEFAULT 'especes',
  mois_concerne   VARCHAR(7) NULL,
  statut          ENUM('pending','approved','rejected') DEFAULT 'pending',
  note            TEXT NULL,
  valide_par      INT NULL,
  valide_at       TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)  REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (membre_id)  REFERENCES membres(id)  ON DELETE CASCADE,
  FOREIGN KEY (seance_id)  REFERENCES seances(id)  ON DELETE SET NULL,
  FOREIGN KEY (valide_par) REFERENCES membres(id)  ON DELETE SET NULL,
  INDEX idx_dahira_statut  (dahira_id, statut),
  INDEX idx_membre_mois    (membre_id, mois_concerne),
  INDEX idx_seance         (seance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── annonces ─────────────────────────────────────────
CREATE TABLE annonces (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id   INT NOT NULL,
  titre       VARCHAR(255) NOT NULL,
  contenu     TEXT NOT NULL,
  type        ENUM('info','important','urgent') DEFAULT 'info',
  publie_par  INT NOT NULL,
  actif       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)  REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (publie_par) REFERENCES membres(id)  ON DELETE CASCADE,
  INDEX idx_dahira_actif (dahira_id, actif),
  INDEX idx_type         (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── evenements ────────────────────────────────────────
CREATE TABLE evenements (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id            INT NOT NULL,
  titre                VARCHAR(255) NOT NULL,
  description          TEXT NULL,
  date_debut           DATETIME NOT NULL,
  date_fin             DATETIME NULL,
  lieu                 VARCHAR(255) NULL,
  type                 ENUM('conference','sortie','ceremonie','formation','autre') DEFAULT 'autre',
  image_url            VARCHAR(500) NULL,
  max_participants     INT NULL,
  inscriptions_ouvertes BOOLEAN DEFAULT TRUE,
  cree_par             INT NOT NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (cree_par)  REFERENCES membres(id)  ON DELETE CASCADE,
  INDEX idx_dahira_date (dahira_id, date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── participations ────────────────────────────────────
CREATE TABLE participations (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  evenement_id INT NOT NULL,
  membre_id    INT NOT NULL,
  dahira_id    INT NOT NULL,
  statut       ENUM('inscrit','confirme','annule','present') DEFAULT 'inscrit',
  note         TEXT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id)    REFERENCES membres(id)    ON DELETE CASCADE,
  FOREIGN KEY (dahira_id)    REFERENCES dahiras(id)    ON DELETE CASCADE,
  UNIQUE KEY unique_participation (evenement_id, membre_id),
  INDEX idx_evenement (evenement_id),
  INDEX idx_membre    (membre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── depenses ─────────────────────────────────────────
CREATE TABLE depenses (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id       INT NOT NULL,
  description     TEXT NOT NULL,
  montant         DECIMAL(10,2) NOT NULL,
  categorie       ENUM('evenements','location','nourriture','donations','maintenance','autres') DEFAULT 'autres',
  mode_paiement   ENUM('especes','wave','orange_money','virement','cheque') DEFAULT 'especes',
  date_depense    DATE NOT NULL,
  justificatif_url VARCHAR(500) NULL,
  statut          ENUM('en_attente','validee','rejetee') DEFAULT 'en_attente',
  cree_par        INT NOT NULL,
  valide_par      INT NULL,
  valide_at       TIMESTAMP NULL,
  note            TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)  REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (cree_par)   REFERENCES membres(id)  ON DELETE CASCADE,
  FOREIGN KEY (valide_par) REFERENCES membres(id)  ON DELETE SET NULL,
  INDEX idx_dahira_statut (dahira_id, statut),
  INDEX idx_categorie     (categorie),
  INDEX idx_date          (date_depense)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── recus ─────────────────────────────────────────────
CREATE TABLE recus (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  cotisation_id  INT NOT NULL,
  dahira_id      INT NOT NULL,
  numero_recu    VARCHAR(100) UNIQUE NOT NULL,
  fichier_path   VARCHAR(500) NULL,
  envoye_email   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cotisation_id) REFERENCES cotisations(id) ON DELETE CASCADE,
  FOREIGN KEY (dahira_id)     REFERENCES dahiras(id)     ON DELETE CASCADE,
  UNIQUE KEY unique_cotisation_recu (cotisation_id),
  INDEX idx_numero_recu (numero_recu),
  INDEX idx_dahira      (dahira_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── notifications ─────────────────────────────────────
CREATE TABLE notifications (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  membre_id  INT NOT NULL,
  dahira_id  INT NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  link       VARCHAR(500) NULL,
  metadata   JSON NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  read_at    TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id) REFERENCES membres(id)  ON DELETE CASCADE,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id)  ON DELETE CASCADE,
  INDEX idx_membre_read (membre_id, is_read),
  INDEX idx_dahira      (dahira_id),
  INDEX idx_type        (type),
  INDEX idx_created     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── password_resets ───────────────────────────────────
CREATE TABLE password_resets (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  membre_id  INT NOT NULL,
  token      VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  used_at    TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  INDEX idx_token   (token),
  INDEX idx_membre  (membre_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── invitations ───────────────────────────────────────
CREATE TABLE invitations (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id   INT NOT NULL,
  membre_id   INT NOT NULL,
  email       VARCHAR(255) NOT NULL,
  role        ENUM('bureau','tresorier','responsable_org','membre') DEFAULT 'membre',
  token       VARCHAR(255) UNIQUE NOT NULL,
  statut      ENUM('pending','accepted','expired','cancelled') DEFAULT 'pending',
  expires_at  TIMESTAMP NOT NULL,
  invited_by  INT NOT NULL,
  accepted_at TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)  REFERENCES dahiras(id)  ON DELETE CASCADE,
  FOREIGN KEY (membre_id)  REFERENCES membres(id)  ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES membres(id)  ON DELETE CASCADE,
  INDEX idx_token          (token),
  INDEX idx_email          (email),
  INDEX idx_statut         (statut),
  INDEX idx_dahira_membre  (dahira_id, membre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── photos ────────────────────────────────────────────
CREATE TABLE photos (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id    INT NOT NULL,
  evenement_id INT NULL,
  titre        VARCHAR(255) NULL,
  description  TEXT NULL,
  fichier_url  VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NULL,
  uploaded_by  INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id)    REFERENCES dahiras(id)    ON DELETE CASCADE,
  FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by)  REFERENCES membres(id)    ON DELETE CASCADE,
  INDEX idx_dahira    (dahira_id),
  INDEX idx_evenement (evenement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
