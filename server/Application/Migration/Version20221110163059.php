<?php

declare(strict_types=1);

namespace Application\Migration;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

class Version20221110163059 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('SET FOREIGN_KEY_CHECKS=0');

        $this->addSql(
            <<<SQL
                CREATE TABLE `account` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `parent_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `balance` INT(11) NOT NULL DEFAULT 0 COMMENT '(DC2Type:Money)',
                  `type` ENUM('asset','liability','revenue','expense','equity','group') NOT NULL COMMENT '(DC2Type:AccountType)',
                  `code` INT(10) UNSIGNED NOT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  `iban` VARCHAR(34) NOT NULL DEFAULT '',
                  `total_balance` INT(11) NOT NULL DEFAULT 0 COMMENT '(DC2Type:Money)',
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `UNIQ_7D3656A477153098` (`code`),
                  UNIQUE KEY `UNIQ_7D3656A47E3C61F9` (`owner_id`),
                  KEY `IDX_7D3656A461220EA6` (`creator_id`),
                  KEY `IDX_7D3656A4E37ECFB0` (`updater_id`),
                  KEY `IDX_7D3656A4727ACA70` (`parent_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_7D3656A461220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_7D3656A4727ACA70` FOREIGN KEY (`parent_id`) REFERENCES `account` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_7D3656A47E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_7D3656A4E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `CONSTRAINT_1` CHECK (`type` <> 'group' OR `balance` = 0)
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `accounting_document` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `expense_claim_id` INT(11) DEFAULT NULL,
                  `transaction_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `filename` VARCHAR(190) NOT NULL DEFAULT '',
                  `mime` VARCHAR(255) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`filename`),
                  KEY `IDX_60EDA78461220EA6` (`creator_id`),
                  KEY `IDX_60EDA7847E3C61F9` (`owner_id`),
                  KEY `IDX_60EDA784E37ECFB0` (`updater_id`),
                  KEY `IDX_60EDA784B6F76666` (`expense_claim_id`),
                  KEY `IDX_60EDA7842FC0CB0F` (`transaction_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_60EDA7842FC0CB0F` FOREIGN KEY (`transaction_id`) REFERENCES `transaction` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_60EDA78461220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_60EDA7847E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_60EDA784B6F76666` FOREIGN KEY (`expense_claim_id`) REFERENCES `expense_claim` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_60EDA784E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `bookable` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `image_id` INT(11) DEFAULT NULL,
                  `credit_account_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `initial_price` INT(11) NOT NULL DEFAULT 0 COMMENT '(DC2Type:Money)',
                  `periodic_price` INT(11) NOT NULL DEFAULT 0 COMMENT '(DC2Type:Money)',
                  `purchase_price` INT(10) UNSIGNED DEFAULT NULL COMMENT '(DC2Type:Money)',
                  `simultaneous_booking_maximum` SMALLINT(6) NOT NULL DEFAULT -1,
                  `booking_type` ENUM('self_approved','application','admin_assigned','admin_approved','mandatory') NOT NULL DEFAULT 'admin_approved' COMMENT '(DC2Type:BookingType)',
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `state` ENUM('good','used','degraded') NOT NULL DEFAULT 'good' COMMENT '(DC2Type:BookableState)',
                  `verification_date` DATE DEFAULT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  `description` TEXT NOT NULL,
                  `code` VARCHAR(10) DEFAULT NULL,
                  `remarks` TEXT NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `UNIQ_A10B81243DA5256D` (`image_id`),
                  UNIQUE KEY `UNIQ_A10B812477153098` (`code`),
                  KEY `IDX_A10B812461220EA6` (`creator_id`),
                  KEY `IDX_A10B81247E3C61F9` (`owner_id`),
                  KEY `IDX_A10B8124E37ECFB0` (`updater_id`),
                  KEY `IDX_A10B81246813E404` (`credit_account_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_A10B81243DA5256D` FOREIGN KEY (`image_id`) REFERENCES `image` (`id`),
                  CONSTRAINT `FK_A10B812461220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_A10B81246813E404` FOREIGN KEY (`credit_account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_A10B81247E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_A10B8124E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `bookable_metadata` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `bookable_id` INT(11) NOT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `value` VARCHAR(191) NOT NULL DEFAULT '',
                  `name` VARCHAR(191) NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`name`,`bookable_id`),
                  KEY `IDX_F11FB12E61220EA6` (`creator_id`),
                  KEY `IDX_F11FB12E7E3C61F9` (`owner_id`),
                  KEY `IDX_F11FB12EE37ECFB0` (`updater_id`),
                  KEY `IDX_F11FB12EEC4F5B2F` (`bookable_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_F11FB12E61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_F11FB12E7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_F11FB12EE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_F11FB12EEC4F5B2F` FOREIGN KEY (`bookable_id`) REFERENCES `bookable` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `bookable_tag` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  `color` VARCHAR(7) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`name`),
                  KEY `IDX_C360AD1261220EA6` (`creator_id`),
                  KEY `IDX_C360AD127E3C61F9` (`owner_id`),
                  KEY `IDX_C360AD12E37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_C360AD1261220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_C360AD127E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_C360AD12E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `bookable_tag_bookable` (
                  `bookable_tag_id` INT(11) NOT NULL,
                  `bookable_id` INT(11) NOT NULL,
                  PRIMARY KEY (`bookable_tag_id`,`bookable_id`),
                  KEY `IDX_207F7C112FF81111` (`bookable_tag_id`),
                  KEY `IDX_207F7C11EC4F5B2F` (`bookable_id`),
                  CONSTRAINT `FK_207F7C112FF81111` FOREIGN KEY (`bookable_tag_id`) REFERENCES `bookable_tag` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_207F7C11EC4F5B2F` FOREIGN KEY (`bookable_id`) REFERENCES `bookable` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `booking` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `bookable_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `status` ENUM('application','booked','processed') NOT NULL DEFAULT 'application' COMMENT '(DC2Type:BookingStatus)',
                  `participant_count` INT(10) UNSIGNED NOT NULL DEFAULT 1,
                  `destination` VARCHAR(50) NOT NULL DEFAULT '',
                  `start_comment` TEXT NOT NULL,
                  `end_comment` TEXT NOT NULL,
                  `start_date` DATETIME NOT NULL,
                  `end_date` DATETIME DEFAULT NULL,
                  `estimated_end_date` VARCHAR(50) NOT NULL DEFAULT '',
                  `remarks` TEXT NOT NULL,
                  `internal_remarks` TEXT NOT NULL,
                  PRIMARY KEY (`id`),
                  KEY `IDX_E00CEDDE61220EA6` (`creator_id`),
                  KEY `IDX_E00CEDDE7E3C61F9` (`owner_id`),
                  KEY `IDX_E00CEDDEE37ECFB0` (`updater_id`),
                  KEY `IDX_E00CEDDEEC4F5B2F` (`bookable_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_E00CEDDE61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_E00CEDDE7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_E00CEDDEE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_E00CEDDEEC4F5B2F` FOREIGN KEY (`bookable_id`) REFERENCES `bookable` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `configuration` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `key` VARCHAR(191) NOT NULL,
                  `value` LONGTEXT NOT NULL,
                  `description` TEXT NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `UNIQ_A5E2A5D74E645A7E` (`key`),
                  KEY `IDX_A5E2A5D761220EA6` (`creator_id`),
                  KEY `IDX_A5E2A5D77E3C61F9` (`owner_id`),
                  KEY `IDX_A5E2A5D7E37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_A5E2A5D761220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_A5E2A5D77E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_A5E2A5D7E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `country` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `code` VARCHAR(2) NOT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `UNIQ_5373C96677153098` (`code`),
                  KEY `IDX_5373C96661220EA6` (`creator_id`),
                  KEY `IDX_5373C9667E3C61F9` (`owner_id`),
                  KEY `IDX_5373C966E37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_5373C96661220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_5373C9667E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_5373C966E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `expense_claim` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) NOT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `reviewer_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `amount` INT(10) UNSIGNED NOT NULL COMMENT '(DC2Type:Money)',
                  `status` ENUM('new','processing','processed','rejected') NOT NULL DEFAULT 'new' COMMENT '(DC2Type:ExpenseClaimStatus)',
                  `type` ENUM('expenseClaim','refund','invoice') NOT NULL DEFAULT 'expenseClaim' COMMENT '(DC2Type:ExpenseClaimType)',
                  `name` VARCHAR(191) NOT NULL,
                  `description` TEXT NOT NULL,
                  `remarks` TEXT NOT NULL,
                  `internal_remarks` TEXT NOT NULL,
                  `sector` VARCHAR(191) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  KEY `IDX_461791D61220EA6` (`creator_id`),
                  KEY `IDX_461791D7E3C61F9` (`owner_id`),
                  KEY `IDX_461791DE37ECFB0` (`updater_id`),
                  KEY `IDX_461791D70574616` (`reviewer_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_461791D61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_461791D70574616` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_461791D7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_461791DE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `image` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `filename` VARCHAR(190) NOT NULL DEFAULT '',
                  `mime` VARCHAR(255) NOT NULL DEFAULT '',
                  `width` INT(11) NOT NULL,
                  `height` INT(11) NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`filename`),
                  KEY `IDX_C53D045F61220EA6` (`creator_id`),
                  KEY `IDX_C53D045F7E3C61F9` (`owner_id`),
                  KEY `IDX_C53D045FE37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_C53D045F61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_C53D045F7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_C53D045FE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `license` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`name`),
                  KEY `IDX_5768F41961220EA6` (`creator_id`),
                  KEY `IDX_5768F4197E3C61F9` (`owner_id`),
                  KEY `IDX_5768F419E37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_5768F41961220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_5768F4197E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_5768F419E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `license_bookable` (
                  `license_id` INT(11) NOT NULL,
                  `bookable_id` INT(11) NOT NULL,
                  PRIMARY KEY (`license_id`,`bookable_id`),
                  KEY `IDX_5D5B1013460F904B` (`license_id`),
                  KEY `IDX_5D5B1013EC4F5B2F` (`bookable_id`),
                  CONSTRAINT `FK_5D5B1013460F904B` FOREIGN KEY (`license_id`) REFERENCES `license` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_5D5B1013EC4F5B2F` FOREIGN KEY (`bookable_id`) REFERENCES `bookable` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `license_user` (
                  `license_id` INT(11) NOT NULL,
                  `user_id` INT(11) NOT NULL,
                  PRIMARY KEY (`license_id`,`user_id`),
                  KEY `IDX_77C835A460F904B` (`license_id`),
                  KEY `IDX_77C835AA76ED395` (`user_id`),
                  CONSTRAINT `FK_77C835A460F904B` FOREIGN KEY (`license_id`) REFERENCES `license` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_77C835AA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `log` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `priority` SMALLINT(6) NOT NULL,
                  `message` VARCHAR(5000) NOT NULL,
                  `referer` VARCHAR(500) NOT NULL,
                  `request` VARCHAR(1000) NOT NULL,
                  `ip` VARCHAR(40) NOT NULL,
                  `extra` LONGTEXT NOT NULL DEFAULT '[]' COMMENT '(DC2Type:json)',
                  `url` VARCHAR(2000) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  KEY `IDX_8F3F68C561220EA6` (`creator_id`),
                  KEY `IDX_8F3F68C57E3C61F9` (`owner_id`),
                  KEY `IDX_8F3F68C5E37ECFB0` (`updater_id`),
                  KEY `message` (`message`(191)),
                  KEY `update_date` (`update_date`),
                  KEY `priority` (`priority`),
                  KEY `creation_date` (`creation_date`),
                  CONSTRAINT `FK_8F3F68C561220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_8F3F68C57E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_8F3F68C5E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `message` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `recipient_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `email` VARCHAR(191) NOT NULL,
                  `type` ENUM('register','unregister','reset_password','balance','leave_family','admin_leave_family') NOT NULL COMMENT '(DC2Type:MessageType)',
                  `date_sent` DATETIME DEFAULT NULL,
                  `subject` VARCHAR(255) NOT NULL DEFAULT '',
                  `body` TEXT NOT NULL,
                  PRIMARY KEY (`id`),
                  KEY `IDX_B6BD307F61220EA6` (`creator_id`),
                  KEY `IDX_B6BD307F7E3C61F9` (`owner_id`),
                  KEY `IDX_B6BD307FE37ECFB0` (`updater_id`),
                  KEY `IDX_B6BD307FE92F8F78` (`recipient_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_B6BD307F61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_B6BD307F7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_B6BD307FE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_B6BD307FE92F8F78` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `transaction` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `expense_claim_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `datatrans_ref` VARCHAR(18) NOT NULL DEFAULT '',
                  `name` VARCHAR(191) NOT NULL,
                  `remarks` TEXT NOT NULL,
                  `internal_remarks` TEXT NOT NULL,
                  `transaction_date` DATETIME NOT NULL,
                  `balance` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '(DC2Type:Money)',
                  PRIMARY KEY (`id`),
                  KEY `IDX_723705D161220EA6` (`creator_id`),
                  KEY `IDX_723705D17E3C61F9` (`owner_id`),
                  KEY `IDX_723705D1E37ECFB0` (`updater_id`),
                  KEY `IDX_723705D1B6F76666` (`expense_claim_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_723705D161220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_723705D17E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_723705D1B6F76666` FOREIGN KEY (`expense_claim_id`) REFERENCES `expense_claim` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_723705D1E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `transaction_line` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `transaction_id` INT(11) NOT NULL,
                  `debit_id` INT(11) DEFAULT NULL,
                  `credit_id` INT(11) DEFAULT NULL,
                  `bookable_id` INT(11) DEFAULT NULL,
                  `transaction_tag_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `balance` INT(10) UNSIGNED NOT NULL COMMENT '(DC2Type:Money)',
                  `is_reconciled` TINYINT(1) NOT NULL DEFAULT 0,
                  `name` VARCHAR(191) NOT NULL,
                  `remarks` TEXT NOT NULL,
                  `transaction_date` DATETIME NOT NULL,
                  `imported_id` VARCHAR(35) DEFAULT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_import` (`transaction_date`,`imported_id`),
                  KEY `IDX_33578A5761220EA6` (`creator_id`),
                  KEY `IDX_33578A577E3C61F9` (`owner_id`),
                  KEY `IDX_33578A57E37ECFB0` (`updater_id`),
                  KEY `IDX_33578A572FC0CB0F` (`transaction_id`),
                  KEY `IDX_33578A57444E82EE` (`debit_id`),
                  KEY `IDX_33578A57CE062FF9` (`credit_id`),
                  KEY `IDX_33578A57EC4F5B2F` (`bookable_id`),
                  KEY `IDX_33578A57CCAF1151` (`transaction_tag_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_33578A572FC0CB0F` FOREIGN KEY (`transaction_id`) REFERENCES `transaction` (`id`),
                  CONSTRAINT `FK_33578A57444E82EE` FOREIGN KEY (`debit_id`) REFERENCES `account` (`id`),
                  CONSTRAINT `FK_33578A5761220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_33578A577E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_33578A57CCAF1151` FOREIGN KEY (`transaction_tag_id`) REFERENCES `transaction_tag` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_33578A57CE062FF9` FOREIGN KEY (`credit_id`) REFERENCES `account` (`id`),
                  CONSTRAINT `FK_33578A57E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_33578A57EC4F5B2F` FOREIGN KEY (`bookable_id`) REFERENCES `bookable` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `transaction_tag` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  `color` VARCHAR(7) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  KEY `IDX_F8CD024A61220EA6` (`creator_id`),
                  KEY `IDX_F8CD024A7E3C61F9` (`owner_id`),
                  KEY `IDX_F8CD024AE37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_F8CD024A61220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_F8CD024A7E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_F8CD024AE37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `user` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `country_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `login` VARCHAR(50) DEFAULT NULL,
                  `first_name` VARCHAR(191) NOT NULL,
                  `last_name` VARCHAR(191) NOT NULL,
                  `password` VARCHAR(255) NOT NULL,
                  `email` VARCHAR(191) DEFAULT NULL,
                  `role` ENUM('booking_only','individual','accounting_verificator','member','formation_responsible','trainer','responsible','administrator') NOT NULL DEFAULT 'individual' COMMENT '(DC2Type:UserRole)',
                  `status` ENUM('inactive','active','new','archived') NOT NULL DEFAULT 'new' COMMENT '(DC2Type:UserStatus)',
                  `welcome_session_date` DATETIME DEFAULT NULL,
                  `resign_date` DATETIME DEFAULT NULL,
                  `sex` SMALLINT(6) NOT NULL DEFAULT 0,
                  `phone` VARCHAR(25) NOT NULL DEFAULT '',
                  `mobile_phone` VARCHAR(25) NOT NULL DEFAULT '',
                  `swiss_sailing` VARCHAR(25) NOT NULL DEFAULT '',
                  `swiss_sailing_type` ENUM('active','passive','junior') DEFAULT NULL COMMENT '(DC2Type:SwissSailingType)',
                  `swiss_windsurf_type` ENUM('active','passive') DEFAULT NULL COMMENT '(DC2Type:SwissWindsurfType)',
                  `birthday` DATE DEFAULT NULL,
                  `terms_agreement` TINYINT(1) NOT NULL DEFAULT 0,
                  `has_insurance` TINYINT(1) NOT NULL DEFAULT 0,
                  `receives_newsletter` TINYINT(1) NOT NULL DEFAULT 0,
                  `family_relationship` ENUM('householder','partner','child','parent','sister','brother') NOT NULL DEFAULT 'householder' COMMENT '(DC2Type:Relationship)',
                  `billing_type` ENUM('electronic','paper') NOT NULL DEFAULT 'electronic' COMMENT '(DC2Type:BillingType)',
                  `token` VARCHAR(32) DEFAULT NULL,
                  `token_creation_date` DATETIME DEFAULT NULL,
                  `door1` TINYINT(1) NOT NULL DEFAULT 1,
                  `door2` TINYINT(1) NOT NULL DEFAULT 1,
                  `door3` TINYINT(1) NOT NULL DEFAULT 1,
                  `door4` TINYINT(1) NOT NULL DEFAULT 0,
                  `remarks` TEXT NOT NULL,
                  `internal_remarks` TEXT NOT NULL,
                  `street` VARCHAR(255) NOT NULL,
                  `postcode` VARCHAR(20) NOT NULL,
                  `locality` VARCHAR(255) NOT NULL,
                  `iban` VARCHAR(34) NOT NULL DEFAULT '',
                  `first_login` DATETIME DEFAULT NULL,
                  `last_login` DATETIME DEFAULT NULL,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `UNIQ_8D93D649AA08CB10` (`login`),
                  UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
                  UNIQUE KEY `UNIQ_8D93D6495F37A13B` (`token`),
                  KEY `IDX_8D93D64961220EA6` (`creator_id`),
                  KEY `IDX_8D93D6497E3C61F9` (`owner_id`),
                  KEY `IDX_8D93D649E37ECFB0` (`updater_id`),
                  KEY `IDX_8D93D649F92F3E70` (`country_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_8D93D64961220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_8D93D6497E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_8D93D649E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_8D93D649F92F3E70` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `user_tag` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `creator_id` INT(11) DEFAULT NULL,
                  `owner_id` INT(11) DEFAULT NULL,
                  `updater_id` INT(11) DEFAULT NULL,
                  `creation_date` DATETIME DEFAULT NULL,
                  `update_date` DATETIME DEFAULT NULL,
                  `name` VARCHAR(191) NOT NULL,
                  `color` VARCHAR(7) NOT NULL DEFAULT '',
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `unique_name` (`name`),
                  KEY `IDX_E89FD60861220EA6` (`creator_id`),
                  KEY `IDX_E89FD6087E3C61F9` (`owner_id`),
                  KEY `IDX_E89FD608E37ECFB0` (`updater_id`),
                  KEY `creation_date` (`creation_date`),
                  KEY `update_date` (`update_date`),
                  CONSTRAINT `FK_E89FD60861220EA6` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_E89FD6087E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
                  CONSTRAINT `FK_E89FD608E37ECFB0` FOREIGN KEY (`updater_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql(
            <<<SQL
                CREATE TABLE `user_tag_user` (
                  `user_tag_id` INT(11) NOT NULL,
                  `user_id` INT(11) NOT NULL,
                  PRIMARY KEY (`user_tag_id`,`user_id`),
                  KEY `IDX_83118DFFDF80782C` (`user_tag_id`),
                  KEY `IDX_83118DFFA76ED395` (`user_id`),
                  CONSTRAINT `FK_83118DFFA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `FK_83118DFFDF80782C` FOREIGN KEY (`user_tag_id`) REFERENCES `user_tag` (`id`) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                SQL
        );

        $this->addSql('SET FOREIGN_KEY_CHECKS=1');

        $this->addSql('INSERT INTO country (id, code, name) VALUES
(1, "CH", "Suisse"),
(2, "FR", "France"),
(3, "AU", "Australie"),
(4, "AT", "Autriche"),
(5, "BE", "Belgique"),
(6, "CA", "Canada"),
(7, "CZ", "République tchèque"),
(8, "DK", "Danemark"),
(9, "FI", "Finlande"),
(10, "DE", "Allemagne"),
(11, "GR", "Grèce"),
(12, "HU", "Hongrie"),
(13, "IS", "Islande"),
(14, "IE", "Irlande"),
(15, "IT", "Italie"),
(16, "JP", "Japon"),
(17, "LU", "Luxembourg"),
(18, "MX", "Mexique"),
(19, "NL", "Pays-Bas"),
(20, "NZ", "Nouvelle-Zélande"),
(21, "NO", "Norvège"),
(22, "PL", "Pologne"),
(23, "PT", "Portugal"),
(24, "SK", "Slovaquie"),
(25, "KR", "Corée du Sud"),
(26, "ES", "Espagne"),
(27, "SE", "Suède"),
(28, "TR", "Turquie"),
(29, "GB", "Angleterre"),
(30, "US", "États-Unis"),
(31, "AX", "Îles Åland"),
(32, "AF", "Afghanistan"),
(33, "AL", "Albanie"),
(34, "DZ", "Algérie"),
(35, "AS", "Samoa américaines"),
(36, "AD", "Andorre"),
(37, "AO", "Angola"),
(38, "AI", "Anguilla"),
(39, "AQ", "Antarctique"),
(40, "AG", "Antigua et Barbuda"),
(41, "AR", "Argentine"),
(42, "AM", "Arménie"),
(43, "AW", "Aruba"),
(44, "AZ", "Azerbaïdjan"),
(45, "BS", "Bahamas"),
(46, "BH", "Bahreïn"),
(47, "BD", "Bangladesh"),
(48, "BB", "Barbade"),
(49, "BY", "Biélorussie"),
(50, "BZ", "Belize"),
(51, "BJ", "Bénin"),
(52, "BM", "Bermudes"),
(53, "BT", "Bhutan"),
(54, "BO", "Bolivie"),
(55, "BQ", "Bonaire, Saint-Eustache et Saba"),
(56, "BA", "Bosnie-Herzégovine"),
(57, "BW", "Botswana"),
(58, "BV", "Île Bouvet"),
(59, "BR", "Brésil"),
(60, "IO", "Territoire britannique de l\'océan Indien"),
(61, "VG", "Îles Vierges"),
(62, "BN", "Brunéi Darussalam"),
(63, "BG", "Bulgarie"),
(64, "BF", "Burkina Faso"),
(65, "BI", "Burundi"),
(66, "KH", "Cambodge"),
(67, "CM", "Cameroun"),
(68, "CV", "Cap-Vert"),
(69, "KY", "Îles Caïmans"),
(70, "CF", "Centrafrique"),
(71, "TD", "Tchad"),
(72, "CL", "Chili"),
(73, "CN", "Chine"),
(74, "CX", "Île Christmas"),
(75, "CC", "Îles Cocos"),
(76, "CO", "Colombie"),
(77, "KM", "Comores"),
(78, "CK", "Îles Cook"),
(79, "CR", "Costa Rica"),
(80, "HR", "Croatie"),
(81, "CU", "Cuba"),
(82, "CW", "Curaçao"),
(83, "CY", "Chypre"),
(84, "CD", "République démocratique du Congo"),
(85, "DJ", "Djibouti"),
(86, "DM", "Dominique"),
(87, "DO", "République Dominicaine"),
(88, "TL", "Timor Oriental"),
(89, "EC", "Équateur"),
(90, "EG", "Égypte"),
(91, "SV", "Salvador"),
(92, "GQ", "Guinée équatoriale"),
(93, "ER", "Érythrée"),
(94, "EE", "Estonie"),
(95, "ET", "Éthiopie"),
(96, "FK", "Îles Malouines"),
(97, "FO", "Îles Féroé"),
(98, "FJ", "Fidji"),
(99, "GF", "Guyane"),
(100, "PF", "Polynésie Française"),
(101, "TF", "Terres australes françaises"),
(102, "GA", "Gabon"),
(103, "GM", "Gambie"),
(104, "GE", "Géorgie"),
(105, "GH", "Ghana"),
(106, "GI", "Gibraltar"),
(107, "GL", "Groenland"),
(108, "GD", "Grenade"),
(109, "GP", "Guadeloupe"),
(110, "GU", "Guam"),
(111, "GT", "Guatemala"),
(112, "GG", "Guernesey"),
(113, "GN", "Guinée"),
(114, "GW", "Guinée-Bissau"),
(115, "GY", "Guyana"),
(116, "HT", "Haïti"),
(117, "HM", "Île Heard et îles McDonald"),
(118, "HN", "Honduras"),
(119, "HK", "Hong Kong"),
(120, "IN", "Inde"),
(121, "ID", "Indonésie"),
(122, "IR", "Iran"),
(123, "IQ", "Irak"),
(124, "IM", "Île de Man"),
(125, "IL", "Israël"),
(126, "CI", "Côte d\'Ivoire"),
(127, "JM", "Jamaïque"),
(128, "JE", "Jersey"),
(129, "JO", "Jordanie"),
(130, "KZ", "Kazakhstan"),
(131, "KE", "Kenya"),
(132, "KI", "Kiribati"),
(133, "XK", "Kosovo"),
(134, "KW", "Koweït"),
(135, "KG", "Kirghizistan"),
(136, "LA", "Laos"),
(137, "LV", "Lettonie"),
(138, "LB", "Liban"),
(139, "LS", "Lesotho"),
(140, "LR", "Liberia"),
(141, "LY", "Libye"),
(142, "LI", "Liechtenstein"),
(143, "LT", "Lituanie"),
(144, "MO", "Macao"),
(145, "MK", "Macédoine"),
(146, "MG", "Madagascar"),
(147, "MW", "Malawi"),
(148, "MY", "Malaisie"),
(149, "MV", "Maldives"),
(150, "ML", "Mali"),
(151, "MT", "Malte"),
(152, "MH", "Îles Marshall"),
(153, "MQ", "Martinique"),
(154, "MR", "Mauritanie"),
(155, "MU", "Maurice"),
(156, "YT", "Mayotte"),
(157, "FM", "Micronésie"),
(158, "MD", "Moldavie"),
(159, "MC", "Monaco"),
(160, "MN", "Mongolie"),
(161, "ME", "Monténégro"),
(162, "MS", "Montserrat"),
(163, "MA", "Maroc"),
(164, "MZ", "Mozambique"),
(165, "MM", "Myanmar"),
(166, "NA", "Namibie"),
(167, "NR", "Nauru"),
(168, "NP", "Népal"),
(169, "AN", "Antilles néerlandaises"),
(170, "NC", "Nouvelle-Calédonie"),
(171, "NI", "Nicaragua"),
(172, "NE", "Niger"),
(173, "NG", "Nigeria"),
(174, "NU", "Nioué"),
(175, "NF", "Île Norfolk"),
(176, "KP", "Corée du Nord"),
(177, "MP", "Îles Mariannes du Nord"),
(178, "OM", "Oman"),
(179, "PK", "Pakistan"),
(180, "PW", "Palaos"),
(181, "PS", "Territoire palestinien"),
(182, "PA", "Panama"),
(183, "PG", "Papouasie-Nouvelle Guinée"),
(184, "PY", "Paraguay"),
(185, "PE", "Pérou"),
(186, "PH", "Philippines"),
(187, "PN", "Pitcairn"),
(188, "PR", "Porto Rico"),
(189, "QA", "Qatar"),
(190, "RE", "Réunion"),
(191, "CG", "Congo-Brazzaville"),
(192, "RO", "Roumanie"),
(193, "RU", "Russie"),
(194, "RW", "Rwanda"),
(195, "ST", "São Tomé-et-Príncipe"),
(196, "BL", "Saint-Barthélémy"),
(197, "SH", "Sainte-Hélène"),
(198, "KN", "Saint-Christophe-et-Niévès"),
(199, "LC", "Sainte-Lucie"),
(200, "MF", "Saint-Martin"), 
(201, "PM", "Saint-Pierre et Miquelon"),
(202, "VC", "Saint-Vincent-et-les Grenadines"),
(203, "WS", "Samoa"),
(204, "SM", "Saint-Marin"),
(205, "SA", "Arabie saoudite"),
(206, "SN", "Sénégal"),
(207, "RS", "Serbie"),
(208, "SC", "Seychelles"),
(209, "SL", "Sierra Leone"),
(210, "SG", "Singapour"),
(211, "SX", "Saint-Martin"),
(212, "SI", "Slovénie"),
(213, "SB", "Îles Salomon"),
(214, "SO", "Somalie"),
(215, "ZA", "Afrique du Sud"),
(216, "GS", "Géorgie du Sud et les îles Sandwich du Sud"),
(217, "SS", "Sud-Soudan"),
(218, "LK", "Sri Lanka"),
(219, "SD", "Soudan"),
(220, "SR", "Surinam"),
(221, "SJ", "Svalbard et Île Jan Mayen"),
(222, "SZ", "Swaziland"),
(223, "SY", "Syrie"),
(224, "TW", "Taïwan"),
(225, "TJ", "Tadjikistan"),
(226, "TZ", "Tanzanie"),
(227, "TH", "Thaïlande"),
(228, "TG", "République Togolaise"),
(229, "TK", "Tokelau"),
(230, "TO", "Tonga"),
(231, "TT", "Trinidad et Tobago"),
(232, "TN", "Tunisie"),
(233, "TM", "Turkménistan"),
(234, "TC", "Îles Turques-et-Caïques"),
(235, "TV", "Tuvalu"),
(236, "UM", "Îles mineures éloignées des États-Unis"),
(237, "VI", "Îles Vierges des États-Unis"),
(238, "UG", "Ouganda"),
(239, "UA", "Ukraine"),
(240, "AE", "Émirats Arabes Unis"),
(241, "UY", "Uruguay"),
(242, "UZ", "Ouzbékistan"),
(243, "VU", "Vanuatu"),
(244, "VA", "Vatican"),
(245, "VE", "Vénézuéla"),
(246, "VN", "Vietnam"),
(247, "WF", "Wallis-et-Futuna"),
(248, "EH", "Sahara Occidental"),
(249, "YE", "Yémen"),
(250, "ZM", "Zambie"),
(251, "ZW", "Zimbabwe")
');
    }
}
