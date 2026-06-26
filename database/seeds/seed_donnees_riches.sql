-- =====================================================
-- Seed : données riches pour la démo Dahira Touba
-- Dahira ID = 1 | Bureau user_id = 1 | Trésorier user_id = 3
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. SÉANCES HISTORIQUES (Jan–Avr 2026) pour enrichir l'évolution
-- =====================================================
INSERT INTO seances (dahira_id, date_seance, heure, lieu, type, theme, cloturee, created_at)
VALUES
(1, '2026-01-10', '20:00:00', 'Domicile Ibrahima Sy',    'dahira',   'Lecture du Coran',                     TRUE,  '2026-01-10 09:00:00'),
(1, '2026-01-24', '20:00:00', 'Domicile Fatou Diop',     'dahira',   'Khassida et zikar',                    TRUE,  '2026-01-24 09:00:00'),
(1, '2026-02-07', '20:00:00', 'Salle communautaire',     'mensuelle','Réunion mensuelle de février',          TRUE,  '2026-02-07 09:00:00'),
(1, '2026-02-21', '20:00:00', 'Domicile Moussa Diop',    'dahira',   'Récitation des Khassidas',             TRUE,  '2026-02-21 09:00:00'),
(1, '2026-03-07', '20:00:00', 'Domicile Ousmane Ba',     'dahira',   'Études des enseignements mourides',    TRUE,  '2026-03-07 09:00:00'),
(1, '2026-03-22', '20:00:00', 'Salle communautaire',     'mensuelle','Assemblée mensuelle mars',             TRUE,  '2026-03-22 09:00:00'),
(1, '2026-04-05', '20:00:00', 'Domicile Aïssatou Fall',  'dahira',   'Khassida Matlaboul Fawzeyni',          TRUE,  '2026-04-05 09:00:00'),
(1, '2026-04-19', '20:00:00', 'Salle communautaire',     'mensuelle','Réunion mensuelle d\'avril',           TRUE,  '2026-04-19 09:00:00');

-- =====================================================
-- 2. DÉPENSES — 20 réparties sur 6 mois
-- =====================================================
INSERT INTO depenses
  (dahira_id, description, montant, categorie, mode_paiement, date_depense, statut, cree_par, valide_par, valide_at, note, created_at)
VALUES
(1, 'Loyer salle de réunion — janvier',      45000.00, 'location',    'especes',      '2026-01-10', 'validee',    1, 1, '2026-01-11 10:00:00', NULL,                   '2026-01-10 09:00:00'),
(1, 'Repas séance mensuelle janvier',         28000.00, 'nourriture',  'wave',         '2026-01-24', 'validee',    1, 1, '2026-01-25 09:00:00', NULL,                   '2026-01-24 08:00:00'),
(1, 'Abonnement internet janvier',            15500.00, 'maintenance', 'orange_money', '2026-01-15', 'validee',    1, 1, '2026-01-16 10:00:00', NULL,                   '2026-01-15 11:00:00'),
(1, 'Loyer salle de réunion — février',      45000.00, 'location',    'especes',      '2026-02-07', 'validee',    3, 1, '2026-02-08 10:00:00', NULL,                   '2026-02-07 09:00:00'),
(1, 'Matériel de bureau (papier, stylos)',    12000.00, 'autres',      'especes',      '2026-02-10', 'validee',    3, 1, '2026-02-11 09:30:00', NULL,                   '2026-02-10 08:30:00'),
(1, 'Restauration — conférence Cheikh',       75000.00, 'nourriture',  'wave',         '2026-02-21', 'validee',    1, 1, '2026-02-22 10:00:00', NULL,                   '2026-02-21 09:00:00'),
(1, 'Loyer salle de réunion — mars',         45000.00, 'location',    'especes',      '2026-03-07', 'validee',    3, 1, '2026-03-08 10:00:00', NULL,                   '2026-03-07 09:00:00'),
(1, 'Réparation climatiseur local',           38000.00, 'maintenance', 'especes',      '2026-03-12', 'validee',    1, 1, '2026-03-13 09:00:00', NULL,                   '2026-03-12 08:00:00'),
(1, 'Achat tapis de prière (lot 20)',         60000.00, 'evenements',  'wave',         '2026-03-22', 'validee',    3, 1, '2026-03-23 11:00:00', NULL,                   '2026-03-22 10:00:00'),
(1, 'Abonnement internet mars',               15500.00, 'maintenance', 'orange_money', '2026-03-15', 'validee',    1, 1, '2026-03-16 10:00:00', NULL,                   '2026-03-15 11:00:00'),
(1, 'Loyer salle de réunion — avril',        45000.00, 'location',    'especes',      '2026-04-05', 'validee',    3, 1, '2026-04-06 10:00:00', NULL,                   '2026-04-05 09:00:00'),
(1, 'Repas séance mensuelle avril',           32000.00, 'nourriture',  'wave',         '2026-04-19', 'validee',    1, 1, '2026-04-20 09:00:00', NULL,                   '2026-04-19 08:00:00'),
(1, 'Don solidarité famille en difficulté',   50000.00, 'donations',   'especes',      '2026-04-15', 'validee',    1, 1, '2026-04-16 10:00:00', NULL,                   '2026-04-15 11:00:00'),
(1, 'Déplacement — cérémonie Tivaouane',      25000.00, 'evenements',  'especes',      '2026-04-22', 'rejetee',    3, 1, '2026-04-23 09:00:00', 'Facture non conforme', '2026-04-22 08:00:00'),
(1, 'Loyer salle de réunion — mai',          45000.00, 'location',    'especes',      '2026-05-05', 'validee',    3, 1, '2026-05-06 10:00:00', NULL,                   '2026-05-05 09:00:00'),
(1, 'Abonnement internet mai',                15500.00, 'maintenance', 'orange_money', '2026-05-15', 'validee',    1, 1, '2026-05-16 10:00:00', NULL,                   '2026-05-15 11:00:00'),
(1, 'Nourriture assemblée générale mai',     120000.00, 'nourriture',  'wave',         '2026-05-30', 'validee',    1, 1, '2026-05-31 09:00:00', NULL,                   '2026-05-30 08:00:00'),
(1, 'Achat sono portable',                    80000.00, 'autres',      'virement',     '2026-05-20', 'validee',    3, 1, '2026-05-21 11:00:00', NULL,                   '2026-05-20 10:00:00'),
(1, 'Loyer salle de réunion — juin',         45000.00, 'location',    'especes',      '2026-06-03', 'en_attente', 3, NULL, NULL,                 NULL,                   '2026-06-03 09:00:00'),
(1, 'Repas séance juin',                      35000.00, 'nourriture',  'wave',         '2026-06-14', 'en_attente', 1, NULL, NULL,                 NULL,                   '2026-06-14 08:00:00');

-- =====================================================
-- 3. COTISATIONS — 50 réparties Jan–Juin 2026
--    Séances Jan (26,27) Fév (28,29) Mar (30,31) Avr (32,33) Mai (13,15,16) Juin (17,18)
-- =====================================================
INSERT INTO cotisations
  (dahira_id, membre_id, seance_id, montant, mode_paiement, statut, declare_par, valide_par, valide_at, note, created_at)
VALUES
-- Séance 26 (10 Jan)
(1, 1, 26, 25000.00, 'especes',      'approved', 1, 1, '2026-01-10 21:00:00', NULL, '2026-01-10 20:30:00'),
(1, 2, 26, 20000.00, 'wave',         'approved', 1, 1, '2026-01-10 21:00:00', NULL, '2026-01-10 20:30:00'),
(1, 4, 26, 30000.00, 'especes',      'approved', 1, 1, '2026-01-10 21:00:00', NULL, '2026-01-10 20:30:00'),
(1, 7, 26, 50000.00, 'wave',         'approved', 1, 1, '2026-01-10 21:00:00', NULL, '2026-01-10 20:30:00'),

-- Séance 27 (24 Jan)
(1, 1, 27, 25000.00, 'especes',      'approved', 1, 1, '2026-01-24 21:00:00', NULL, '2026-01-24 20:30:00'),
(1, 3, 27, 15000.00, 'orange_money', 'approved', 1, 1, '2026-01-24 21:00:00', NULL, '2026-01-24 20:30:00'),
(1, 5, 27, 10000.00, 'wave',         'approved', 1, 1, '2026-01-24 21:00:00', NULL, '2026-01-24 20:30:00'),
(1, 6, 27, 20000.00, 'especes',      'approved', 1, 1, '2026-01-24 21:00:00', NULL, '2026-01-24 20:30:00'),

-- Séance 28 (07 Fév)
(1, 2, 28, 20000.00, 'especes',      'approved', 1, 1, '2026-02-07 21:00:00', NULL, '2026-02-07 20:30:00'),
(1, 4, 28, 30000.00, 'wave',         'approved', 1, 1, '2026-02-07 21:00:00', NULL, '2026-02-07 20:30:00'),
(1, 5, 28, 10000.00, 'orange_money', 'approved', 1, 1, '2026-02-07 21:00:00', NULL, '2026-02-07 20:30:00'),
(1, 6, 28, 20000.00, 'especes',      'approved', 1, 1, '2026-02-07 21:00:00', NULL, '2026-02-07 20:30:00'),
(1, 7, 28, 50000.00, 'wave',         'approved', 1, 1, '2026-02-07 21:00:00', NULL, '2026-02-07 20:30:00'),

-- Séance 29 (21 Fév)
(1, 1, 29, 25000.00, 'especes',      'approved', 1, 1, '2026-02-21 21:00:00', NULL, '2026-02-21 20:30:00'),
(1, 3, 29, 15000.00, 'wave',         'approved', 1, 1, '2026-02-21 21:00:00', NULL, '2026-02-21 20:30:00'),
(1, 7, 29, 50000.00, 'orange_money', 'approved', 1, 1, '2026-02-21 21:00:00', NULL, '2026-02-21 20:30:00'),

-- Séance 30 (07 Mar)
(1, 1, 30, 25000.00, 'wave',         'approved', 1, 1, '2026-03-07 21:00:00', NULL, '2026-03-07 20:30:00'),
(1, 2, 30, 20000.00, 'especes',      'approved', 1, 1, '2026-03-07 21:00:00', NULL, '2026-03-07 20:30:00'),
(1, 4, 30, 30000.00, 'wave',         'approved', 1, 1, '2026-03-07 21:00:00', NULL, '2026-03-07 20:30:00'),
(1, 6, 30, 20000.00, 'orange_money', 'approved', 1, 1, '2026-03-07 21:00:00', NULL, '2026-03-07 20:30:00'),

-- Séance 31 (22 Mar)
(1, 3, 31, 15000.00, 'especes',      'approved', 1, 1, '2026-03-22 21:00:00', NULL, '2026-03-22 20:30:00'),
(1, 5, 31, 10000.00, 'wave',         'approved', 1, 1, '2026-03-22 21:00:00', NULL, '2026-03-22 20:30:00'),
(1, 7, 31, 50000.00, 'especes',      'approved', 1, 1, '2026-03-22 21:00:00', NULL, '2026-03-22 20:30:00'),

-- Séance 32 (05 Avr)
(1, 1, 32, 25000.00, 'especes',      'approved', 1, 1, '2026-04-05 21:00:00', NULL, '2026-04-05 20:30:00'),
(1, 2, 32, 20000.00, 'wave',         'approved', 1, 1, '2026-04-05 21:00:00', NULL, '2026-04-05 20:30:00'),
(1, 4, 32, 30000.00, 'orange_money', 'approved', 1, 1, '2026-04-05 21:00:00', NULL, '2026-04-05 20:30:00'),
(1, 5, 32, 10000.00, 'especes',      'approved', 1, 1, '2026-04-05 21:00:00', NULL, '2026-04-05 20:30:00'),

-- Séance 33 (19 Avr)
(1, 3, 33, 15000.00, 'wave',         'approved', 1, 1, '2026-04-19 21:00:00', NULL, '2026-04-19 20:30:00'),
(1, 6, 33, 20000.00, 'especes',      'approved', 1, 1, '2026-04-19 21:00:00', NULL, '2026-04-19 20:30:00'),
(1, 7, 33, 50000.00, 'wave',         'approved', 1, 1, '2026-04-19 21:00:00', NULL, '2026-04-19 20:30:00'),

-- Séances Mai — ID 13 (02 Mai), 15 (16 Mai), 16 (30 Mai)
(1, 1, 13, 25000.00, 'especes',      'approved', 1, 1, '2026-05-02 21:00:00', NULL, '2026-05-02 20:30:00'),
(1, 2, 13, 20000.00, 'orange_money', 'approved', 1, 1, '2026-05-02 21:00:00', NULL, '2026-05-02 20:30:00'),
(1, 4, 13, 30000.00, 'especes',      'approved', 1, 1, '2026-05-02 21:00:00', NULL, '2026-05-02 20:30:00'),
(1, 7, 13, 50000.00, 'wave',         'approved', 1, 1, '2026-05-02 21:00:00', NULL, '2026-05-02 20:30:00'),

(1, 3, 15, 15000.00, 'especes',      'approved', 1, 1, '2026-05-16 21:00:00', NULL, '2026-05-16 20:30:00'),
(1, 5, 15, 10000.00, 'wave',         'approved', 1, 1, '2026-05-16 21:00:00', NULL, '2026-05-16 20:30:00'),
(1, 6, 15, 20000.00, 'orange_money', 'approved', 1, 1, '2026-05-16 21:00:00', NULL, '2026-05-16 20:30:00'),

(1, 1, 16, 25000.00, 'wave',         'approved', 1, 1, '2026-05-30 21:00:00', NULL, '2026-05-30 20:30:00'),
(1, 2, 16, 20000.00, 'especes',      'approved', 1, 1, '2026-05-30 21:00:00', NULL, '2026-05-30 20:30:00'),
(1, 4, 16, 30000.00, 'wave',         'approved', 1, 1, '2026-05-30 21:00:00', NULL, '2026-05-30 20:30:00'),
(1, 7, 16, 50000.00, 'especes',      'approved', 1, 1, '2026-05-30 21:00:00', NULL, '2026-05-30 20:30:00'),

-- Séances Juin — ID 17 (06 Juin), 18 (13 Juin)
(1, 1, 17, 25000.00, 'especes',      'approved', 1, 1, '2026-06-06 21:00:00', NULL, '2026-06-06 20:30:00'),
(1, 3, 17, 15000.00, 'wave',         'approved', 1, 1, '2026-06-06 21:00:00', NULL, '2026-06-06 20:30:00'),
(1, 5, 17, 10000.00, 'especes',      'pending',  1, NULL, NULL,               NULL, '2026-06-06 20:30:00'),
(1, 6, 17, 20000.00, 'orange_money', 'approved', 1, 1, '2026-06-06 21:00:00', NULL, '2026-06-06 20:30:00'),

(1, 2, 18, 20000.00, 'wave',         'approved', 1, 1, '2026-06-13 21:00:00', NULL, '2026-06-13 20:30:00'),
(1, 4, 18, 30000.00, 'especes',      'approved', 1, 1, '2026-06-13 21:00:00', NULL, '2026-06-13 20:30:00'),
(1, 7, 18, 50000.00, 'wave',         'approved', 1, 1, '2026-06-13 21:00:00', NULL, '2026-06-13 20:30:00');

-- =====================================================
-- 4. PRÉSENCES — pour les séances clôturées (13, 15, 16, 26–33)
-- =====================================================
INSERT IGNORE INTO presences (seance_id, membre_id, dahira_id, present, enregistre_par, created_at)
VALUES
(13, 1, 1, TRUE,  1, '2026-05-02 21:30:00'),
(13, 2, 1, TRUE,  1, '2026-05-02 21:30:00'),
(13, 3, 1, TRUE,  1, '2026-05-02 21:30:00'),
(13, 4, 1, FALSE, 1, '2026-05-02 21:30:00'),
(13, 5, 1, TRUE,  1, '2026-05-02 21:30:00'),
(13, 6, 1, TRUE,  1, '2026-05-02 21:30:00'),
(13, 7, 1, TRUE,  1, '2026-05-02 21:30:00'),
(15, 1, 1, TRUE,  1, '2026-05-16 21:30:00'),
(15, 2, 1, FALSE, 1, '2026-05-16 21:30:00'),
(15, 3, 1, TRUE,  1, '2026-05-16 21:30:00'),
(15, 4, 1, TRUE,  1, '2026-05-16 21:30:00'),
(15, 5, 1, TRUE,  1, '2026-05-16 21:30:00'),
(15, 6, 1, FALSE, 1, '2026-05-16 21:30:00'),
(15, 7, 1, TRUE,  1, '2026-05-16 21:30:00'),
(16, 1, 1, TRUE,  1, '2026-05-30 21:30:00'),
(16, 2, 1, TRUE,  1, '2026-05-30 21:30:00'),
(16, 3, 1, FALSE, 1, '2026-05-30 21:30:00'),
(16, 4, 1, TRUE,  1, '2026-05-30 21:30:00'),
(16, 5, 1, TRUE,  1, '2026-05-30 21:30:00'),
(16, 6, 1, TRUE,  1, '2026-05-30 21:30:00'),
(16, 7, 1, FALSE, 1, '2026-05-30 21:30:00'),
(26, 1, 1, TRUE,  1, '2026-01-10 21:30:00'),
(26, 2, 1, TRUE,  1, '2026-01-10 21:30:00'),
(26, 3, 1, FALSE, 1, '2026-01-10 21:30:00'),
(26, 4, 1, TRUE,  1, '2026-01-10 21:30:00'),
(26, 5, 1, TRUE,  1, '2026-01-10 21:30:00'),
(26, 6, 1, TRUE,  1, '2026-01-10 21:30:00'),
(26, 7, 1, TRUE,  1, '2026-01-10 21:30:00'),
(27, 1, 1, TRUE,  1, '2026-01-24 21:30:00'),
(27, 2, 1, FALSE, 1, '2026-01-24 21:30:00'),
(27, 3, 1, TRUE,  1, '2026-01-24 21:30:00'),
(27, 5, 1, TRUE,  1, '2026-01-24 21:30:00'),
(27, 6, 1, TRUE,  1, '2026-01-24 21:30:00'),
(27, 7, 1, TRUE,  1, '2026-01-24 21:30:00');

-- =====================================================
-- 5. ANNONCES — 5 nouvelles (structure réelle : pas de 'type' ni 'actif')
-- =====================================================
INSERT INTO annonces (dahira_id, publie_par, titre, contenu, epinglee, created_at)
VALUES
(1, 1, 'Assemblée générale annuelle — 28 juin 2026',
 'Tous les membres sont conviés à l\'assemblée générale annuelle du Dahira Touba. Elle aura lieu le samedi 28 juin à 10h00. Ordre du jour : bilan financier, élection du bureau, perspectives 2026-2027.',
 TRUE,  '2026-06-10 08:00:00'),

(1, 3, 'Rappel : cotisations de juin en attente',
 'Plusieurs membres n\'ont pas encore réglé leur cotisation du mois de juin. Merci de vous rapprocher du trésorier avant le 25 juin.',
 FALSE, '2026-06-15 09:00:00'),

(1, 1, 'Visite du Cheikh — 5 juillet 2026',
 'Nous avons l\'honneur d\'annoncer la visite de notre guide spirituel le dimanche 5 juillet 2026. Cérémonie de bienvenue à 16h00.',
 TRUE,  '2026-06-12 14:00:00'),

(1, 3, 'Résultats bilan financier — mai 2026',
 'Le bilan financier de mai 2026 est disponible. Cotisations : 685 000 FCFA. Dépenses validées : 280 000 FCFA. Solde : +405 000 FCFA.',
 FALSE, '2026-06-02 10:00:00'),

(1, 1, 'Collecte solidaire — Aide à la famille Sow',
 'Suite au décès du père d\'un de nos membres, une collecte solidaire est organisée. Contributions à remettre au trésorier.',
 FALSE, '2026-06-08 11:00:00');

-- =====================================================
-- 6. ÉVÉNEMENTS — 4 nouveaux
-- =====================================================
INSERT INTO evenements (dahira_id, cree_par, titre, description, date_evenement, heure, lieu, created_at)
VALUES
(1, 1, 'Grand Magal de Touba 2026',
 'Pèlerinage annuel au Grand Magal de Touba. Transport collectif organisé. Inscription obligatoire avant le 10 juillet.',
 '2026-07-20', '06:00:00', 'Touba, Sénégal', '2026-06-01 09:00:00'),

(1, 3, 'Conférence : Valeurs du Mouridisme',
 'Conférence animée par un érudit mouride invité. Thème : "Les enseignements de Cheikh Ahmadou Bamba aujourd\'hui".',
 '2026-07-05', '16:00:00', 'Salle communautaire, Dakar', '2026-06-05 10:00:00'),

(1, 1, 'Tournoi sportif inter-Dahiras',
 'Tournoi de football et lutte sénégalaise entre plusieurs dahiras de Dakar. Équipes à inscrire avant le 15 juillet.',
 '2026-07-26', '08:00:00', 'Stade Demba Diop, Dakar', '2026-06-10 11:00:00'),

(1, 3, 'Soirée culturelle et gastronomique',
 'Soirée de partage autour de la cuisine sénégalaise. Animation musicale et récitation du Coran. Entrée libre.',
 '2026-06-28', '19:00:00', 'Domicile du Président, Dakar', '2026-06-14 15:00:00');

SET FOREIGN_KEY_CHECKS = 1;
