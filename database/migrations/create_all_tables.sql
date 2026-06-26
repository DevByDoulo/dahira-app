-- =====================================================
-- Migration complète pour Dahira App
-- =====================================================

-- Table: dahiras
CREATE TABLE IF NOT EXISTS dahiras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: membres
CREATE TABLE IF NOT EXISTS membres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE,
  lieu_naissance VARCHAR(255),
  telephone VARCHAR(20),
  email VARCHAR(255),
  adresse TEXT,
  profession VARCHAR(255),
  responsabilite VARCHAR(100),
  photo_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  actif BOOLEAN DEFAULT TRUE,
  date_adhesion DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  INDEX idx_dahira_actif (dahira_id, actif),
  INDEX idx_nom (nom, prenom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  membre_id INT,
  nom VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('bureau', 'tresorier', 'membre') DEFAULT 'membre',
  photo_url VARCHAR(500) NULL,
  thumbnail_url VARCHAR(500) NULL,
  actif BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE SET NULL,
  INDEX idx_telephone (telephone),
  INDEX idx_dahira_role (dahira_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: seances
CREATE TABLE IF NOT EXISTS seances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  type ENUM('hebdomadaire', 'mensuelle', 'speciale', 'assemblee_generale') DEFAULT 'hebdomadaire',
  date_seance DATETIME NOT NULL,
  heure_debut TIME,
  heure_fin TIME,
  lieu VARCHAR(255),
  theme VARCHAR(255),
  description TEXT,
  cloturee BOOLEAN DEFAULT FALSE,
  rappel_envoye BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dahira_date (dahira_id, date_seance),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: cotisations
CREATE TABLE IF NOT EXISTS cotisations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  membre_id INT NOT NULL,
  seance_id INT,
  montant DECIMAL(10, 2) NOT NULL,
  mode_paiement ENUM('especes', 'wave', 'orange_money', 'virement') DEFAULT 'especes',
  mois_concerne VARCHAR(7),
  statut ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  note TEXT,
  valide_par INT,
  valide_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE SET NULL,
  FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dahira_statut (dahira_id, statut),
  INDEX idx_membre_mois (membre_id, mois_concerne),
  INDEX idx_seance (seance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: presences
CREATE TABLE IF NOT EXISTS presences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seance_id INT NOT NULL,
  membre_id INT NOT NULL,
  dahira_id INT NOT NULL,
  present BOOLEAN DEFAULT TRUE,
  enregistre_par INT,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (enregistre_par) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_presence (seance_id, membre_id),
  INDEX idx_seance (seance_id),
  INDEX idx_membre (membre_id),
  INDEX idx_dahira (dahira_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: annonces
CREATE TABLE IF NOT EXISTS annonces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  type ENUM('info', 'important', 'urgent') DEFAULT 'info',
  publie_par INT NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (publie_par) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dahira_actif (dahira_id, actif),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: evenements
CREATE TABLE IF NOT EXISTS evenements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME,
  lieu VARCHAR(255),
  type ENUM('conference', 'sortie', 'ceremonie', 'formation', 'autre') DEFAULT 'autre',
  image_url VARCHAR(500),
  max_participants INT,
  inscriptions_ouvertes BOOLEAN DEFAULT TRUE,
  cree_par INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (cree_par) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dahira_date (dahira_id, date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: participations (inscriptions aux événements)
CREATE TABLE IF NOT EXISTS participations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evenement_id INT NOT NULL,
  membre_id INT NOT NULL,
  dahira_id INT NOT NULL,
  statut ENUM('inscrit', 'confirme', 'annule', 'present') DEFAULT 'inscrit',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participation (evenement_id, membre_id),
  INDEX idx_evenement (evenement_id),
  INDEX idx_membre (membre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: depenses
CREATE TABLE IF NOT EXISTS depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  description TEXT NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  categorie ENUM('evenements', 'location', 'nourriture', 'donations', 'maintenance', 'autres') DEFAULT 'autres',
  mode_paiement ENUM('especes', 'wave', 'orange_money', 'virement', 'cheque') DEFAULT 'especes',
  date_depense DATE NOT NULL,
  justificatif_url VARCHAR(500),
  statut ENUM('en_attente', 'validee', 'rejetee') DEFAULT 'en_attente',
  cree_par INT NOT NULL,
  valide_par INT,
  valide_at TIMESTAMP NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (cree_par) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dahira_statut (dahira_id, statut),
  INDEX idx_categorie (categorie),
  INDEX idx_date (date_depense)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: recus
CREATE TABLE IF NOT EXISTS recus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cotisation_id INT NOT NULL,
  dahira_id INT NOT NULL,
  numero_recu VARCHAR(100) UNIQUE NOT NULL,
  fichier_path VARCHAR(500),
  envoye_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cotisation_id) REFERENCES cotisations(id) ON DELETE CASCADE,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cotisation_recu (cotisation_id),
  INDEX idx_numero_recu (numero_recu),
  INDEX idx_dahira (dahira_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  dahira_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  metadata JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_dahira (dahira_id),
  INDEX idx_type (type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: password_resets
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: invitations
CREATE TABLE IF NOT EXISTS invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  membre_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('bureau', 'tresorier', 'membre') DEFAULT 'membre',
  token VARCHAR(255) UNIQUE NOT NULL,
  statut ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  invited_by INT NOT NULL,
  accepted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_statut (statut),
  INDEX idx_dahira_membre (dahira_id, membre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: photos (galerie photos événements)
CREATE TABLE IF NOT EXISTS photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  evenement_id INT,
  titre VARCHAR(255),
  description TEXT,
  fichier_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dahira (dahira_id),
  INDEX idx_evenement (evenement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Données de test (optionnel)
-- =====================================================

-- Insérer un dahira de test
INSERT INTO dahiras (nom, adresse, telephone, email, description) 
VALUES ('Dahira Touba', '10 Rue de la Paix, Dakar', '221771234567', 'contact@dahira-touba.sn', 'Dahira de test')
ON DUPLICATE KEY UPDATE nom=nom;

-- Note: Les autres données de test doivent être insérées après avoir vérifié l'ID du dahira créé
