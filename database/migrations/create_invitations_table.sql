-- Table pour gérer les invitations de membres
CREATE TABLE IF NOT EXISTS invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dahira_id INT NOT NULL,
  membre_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('membre', 'tresorier', 'bureau') DEFAULT 'membre',
  token VARCHAR(255) NOT NULL UNIQUE,
  statut ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending',
  expires_at DATETIME NOT NULL,
  invited_by INT NOT NULL,
  accepted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (dahira_id) REFERENCES dahiras(id) ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_token (token),
  INDEX idx_statut (statut),
  INDEX idx_dahira_membre (dahira_id, membre_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour optimiser les recherches
CREATE INDEX idx_invitations_pending ON invitations(dahira_id, statut, expires_at);
