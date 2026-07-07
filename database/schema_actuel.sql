
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `annonces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annonces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cible_groupe` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'tous',
  `epinglee` tinyint(1) DEFAULT '0',
  `type` enum('info','important','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `publie_par` int NOT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `publie_par` (`publie_par`),
  KEY `idx_dahira_actif` (`dahira_id`,`actif`),
  KEY `idx_type` (`type`),
  CONSTRAINT `annonces_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `annonces_ibfk_2` FOREIGN KEY (`publie_par`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cotisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotisations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `membre_id` int NOT NULL,
  `seance_id` int DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode_paiement` enum('especes','wave','orange_money','virement') COLLATE utf8mb4_unicode_ci DEFAULT 'especes',
  `mois_concerne` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `valide_par` int DEFAULT NULL,
  `valide_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `valide_par` (`valide_par`),
  KEY `idx_dahira_statut` (`dahira_id`,`statut`),
  KEY `idx_membre_mois` (`membre_id`,`mois_concerne`),
  KEY `idx_seance` (`seance_id`),
  CONSTRAINT `cotisations_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotisations_ibfk_2` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotisations_ibfk_3` FOREIGN KEY (`seance_id`) REFERENCES `seances` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cotisations_ibfk_4` FOREIGN KEY (`valide_par`) REFERENCES `membres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=445 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dahiras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dahiras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `depenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `depenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `categorie` enum('evenements','location','nourriture','donations','maintenance','autres') COLLATE utf8mb4_unicode_ci DEFAULT 'autres',
  `mode_paiement` enum('especes','wave','orange_money','virement','cheque') COLLATE utf8mb4_unicode_ci DEFAULT 'especes',
  `date_depense` date NOT NULL,
  `justificatif_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('en_attente','validee','rejetee') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `cree_par` int NOT NULL,
  `valide_par` int DEFAULT NULL,
  `valide_at` timestamp NULL DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cree_par` (`cree_par`),
  KEY `valide_par` (`valide_par`),
  KEY `idx_dahira_statut` (`dahira_id`,`statut`),
  KEY `idx_categorie` (`categorie`),
  KEY `idx_date` (`date_depense`),
  CONSTRAINT `depenses_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `depenses_ibfk_2` FOREIGN KEY (`cree_par`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `depenses_ibfk_3` FOREIGN KEY (`valide_par`) REFERENCES `membres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evenements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evenements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime DEFAULT NULL,
  `lieu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('conference','sortie','ceremonie','formation','autre') COLLATE utf8mb4_unicode_ci DEFAULT 'autre',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `inscriptions_ouvertes` tinyint(1) DEFAULT '1',
  `cree_par` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cree_par` (`cree_par`),
  KEY `idx_dahira_date` (`dahira_id`,`date_debut`),
  CONSTRAINT `evenements_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evenements_ibfk_2` FOREIGN KEY (`cree_par`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `membre_id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('secretaire_general','adjoint','tresorier','responsable_org','membre') COLLATE utf8mb4_unicode_ci DEFAULT 'membre',
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('pending','accepted','expired','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `expires_at` timestamp NOT NULL,
  `invited_by` int NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `membre_id` (`membre_id`),
  KEY `invited_by` (`invited_by`),
  KEY `idx_token` (`token`),
  KEY `idx_email` (`email`),
  KEY `idx_statut` (`statut`),
  KEY `idx_dahira_membre` (`dahira_id`,`membre_id`),
  CONSTRAINT `invitations_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invitations_ibfk_2` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invitations_ibfk_3` FOREIGN KEY (`invited_by`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `membres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `lieu_naissance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `profession` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsabilites` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_secours` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_adhesion` date DEFAULT NULL,
  `sexe` enum('M','F') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin','secretaire_general','adjoint','tresorier','responsable_org','membre') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'membre',
  `is_owner` tinyint(1) NOT NULL DEFAULT '0',
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telephone` (`telephone`),
  UNIQUE KEY `unique_email_per_dahira` (`dahira_id`,`email`),
  KEY `idx_dahira_actif` (`dahira_id`,`actif`) USING BTREE,
  KEY `idx_telephone` (`telephone`),
  KEY `idx_dahira_role` (`dahira_id`,`role`),
  KEY `idx_nom` (`nom`),
  CONSTRAINT `membres_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membre_id` int NOT NULL,
  `dahira_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_membre_read` (`membre_id`,`is_read`),
  KEY `idx_dahira` (`dahira_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `participations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evenement_id` int NOT NULL,
  `membre_id` int NOT NULL,
  `dahira_id` int NOT NULL,
  `statut` enum('inscrit','confirme','annule','present') COLLATE utf8mb4_unicode_ci DEFAULT 'inscrit',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participation` (`evenement_id`,`membre_id`),
  KEY `dahira_id` (`dahira_id`),
  KEY `idx_evenement` (`evenement_id`),
  KEY `idx_membre` (`membre_id`),
  CONSTRAINT `participations_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `participations_ibfk_2` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `participations_ibfk_3` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membre_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_membre` (`membre_id`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `evenement_id` int DEFAULT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `fichier_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_dahira` (`dahira_id`),
  KEY `idx_evenement` (`evenement_id`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `photos_ibfk_2` FOREIGN KEY (`evenement_id`) REFERENCES `evenements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `photos_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `recus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotisation_id` int NOT NULL,
  `dahira_id` int NOT NULL,
  `numero_recu` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fichier_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `envoye_email` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_recu` (`numero_recu`),
  UNIQUE KEY `unique_cotisation_recu` (`cotisation_id`),
  KEY `idx_numero_recu` (`numero_recu`),
  KEY `idx_dahira` (`dahira_id`),
  CONSTRAINT `recus_ibfk_1` FOREIGN KEY (`cotisation_id`) REFERENCES `cotisations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recus_ibfk_2` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `seances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int NOT NULL,
  `type` enum('dahira','mensuelle','autre') COLLATE utf8mb4_unicode_ci DEFAULT 'dahira',
  `date_seance` datetime NOT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL,
  `lieu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theme` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cloturee` tinyint(1) DEFAULT '0',
  `rappel_envoye` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_dahira_date` (`dahira_id`,`date_seance`),
  KEY `idx_type` (`type`),
  CONSTRAINT `seances_ibfk_1` FOREIGN KEY (`dahira_id`) REFERENCES `dahiras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seances_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `membres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dahira_id` int DEFAULT NULL,
  `membre_id` int DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','secretaire_general','adjoint','bureau','tresorier','responsable_org','membre') COLLATE utf8mb4_unicode_ci DEFAULT 'membre',
  `is_owner` tinyint(1) DEFAULT '0',
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `email_notifications` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telephone` (`telephone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

