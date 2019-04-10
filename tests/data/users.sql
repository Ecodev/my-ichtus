START TRANSACTION;

REPLACE INTO user (id, owner_id, login, first_name, last_name, email, password, role, status, welcome_session_date, family_relationship, door4, iban) VALUES
(-1000, NULL, 'administrator', 'Admin', 'Istrator', 'administrator@example.com', MD5('administrator'), 'administrator', 'active', '2018-01-01 12:00:00', 'householder', 1, NULL),
(-1001, NULL, 'responsible', 'Respon', 'Sable', 'responsible@example.com', MD5('responsible'), 'responsible', 'active', '2018-01-01 12:00:00', 'householder', 1, NULL),
(-1002, NULL, 'member', 'Active', 'Member', 'member@example.com', MD5('member'), 'member', 'active', '2018-01-01 12:00:00', 'householder', 0, 'CH4200681926673315051'),
(-1003, NULL, 'bookingonly', 'Booking', 'Only', 'bookingonly@example.com', MD5('bookingonly'), 'booking_only', 'active', '2018-01-01 12:00:00', 'householder', 0, NULL),
(-1004, NULL, 'newmember', 'New', 'User', 'newmember@example.com', MD5('newmember'), 'member', 'new', NULL, 'householder', 0, NULL),
(-1005, NULL, 'inactive', 'Inactive', 'Member', 'inactive@example.com', MD5('inactive'), 'member', 'inactive', '2018-01-01 12:00:00', 'householder', 0, NULL),
(-1006, NULL, 'archived', 'Archived', 'Member', 'archived@example.com', MD5('archived'), 'member', 'archived', '2018-01-01 12:00:00', 'householder', 0, NULL),
(-1007, -1002, 'individual', 'Conj', 'Oint', 'conjoint@example.com', MD5('individual'), 'individual', 'active', '2018-01-01 12:00:00', 'partner', 0, 'CH6303714697192579556'),
(-1008, -1002, 'son', 'So', 'n', NULL, MD5('son'), 'individual', 'active', '2018-01-01 12:00:00', 'child', 0, 'CH7826637586626482007'),
(-1009, -1002, 'daughter', 'daugh', 'ter', NULL, MD5('daughter'), 'individual', 'active' ,'2018-01-01 12:00:00', 'child', 0, NULL),
(-1010, NULL, 'voiliermember', 'Voilier', 'Member', 'voiliermember@example.com', MD5('voiliermember'), 'member', 'archived', '2018-01-01 12:00:00', 'householder', 0, NULL),
(-1011, -1010, 'voilierfamily', 'Voilier', 'Family', 'voilierfamily@example.com', MD5('voilierfamily'), 'individual', 'active', '2018-01-01 12:00:00', 'partner', 0, NULL);

COMMIT;