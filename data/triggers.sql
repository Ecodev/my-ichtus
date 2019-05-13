/*
| Account type | Debit        | Credit       |
|:------------:|:------------:|:------------:|
| Asset        | Increase (+) | Decrease (-) |
| Liability    | Decrease (-) | Increase (+) |
| Equity       | Decrease (-) | Increase (+) |
| Expense      | Increase (+) | Decrease (-) |
| Revenue      | Decrease (-) | Increase (+) |
| Group        | N/A          | N/A          |
 */

DROP TRIGGER IF EXISTS transaction_DELETE;

DELIMITER ~~

CREATE TRIGGER transaction_DELETE
    BEFORE DELETE
    ON transaction
    FOR EACH ROW
BEGIN
    -- Manually cascade the delete so that the transaction_line trigger is activated correctly, see https://jira.mariadb.org/browse/MDEV-19402
    DELETE FROM transaction_line WHERE transaction_id = OLD.id;
END; ~~

DELIMITER ;


DROP TRIGGER IF EXISTS transaction_line_INSERT;

DELIMITER //

CREATE TRIGGER transaction_line_INSERT
  AFTER INSERT
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Update debit account balance */
    IF NEW.debit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('liability', 'equity', 'revenue'), account.balance - CAST(NEW.balance AS SIGNED), IF(account.type IN ('asset', 'expense'), account.balance + CAST(NEW.balance AS SIGNED), account.balance)) WHERE account.id=NEW.debit_id;
    END IF;

    /* Update credit account balance */
    IF NEW.credit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('asset', 'expense'), account.balance - CAST(NEW.balance AS SIGNED), IF(account.type IN ('liability', 'equity', 'revenue'), account.balance + CAST(NEW.balance AS SIGNED), account.balance)) WHERE account.id=NEW.credit_id;
    END IF;
  END; //

DELIMITER ;

DROP TRIGGER IF EXISTS transaction_line_DELETE;

DELIMITER //

CREATE TRIGGER transaction_line_DELETE
  AFTER DELETE
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Revert debit account balance */
    IF OLD.debit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('liability', 'equity', 'revenue'), account.balance + CAST(OLD.balance AS SIGNED), IF(account.type IN ('asset', 'expense'), account.balance - CAST(OLD.balance AS SIGNED), account.balance)) WHERE account.id=OLD.debit_id;
    END IF;

    /* Revert credit account balance */
    IF OLD.credit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('asset', 'expense'), account.balance + CAST(OLD.balance AS SIGNED), IF(account.type IN ('liability', 'equity', 'revenue'), account.balance - CAST(OLD.balance AS SIGNED), account.balance)) WHERE account.id=OLD.credit_id;
    END IF;
  END; //

DELIMITER ;

DROP TRIGGER IF EXISTS transaction_line_UPDATE;

DELIMITER //

CREATE TRIGGER transaction_line_UPDATE
  AFTER UPDATE
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Revert previous debit account balance */
    IF OLD.debit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('liability', 'equity', 'revenue'), account.balance + CAST(OLD.balance AS SIGNED), IF(account.type IN ('asset', 'expense'), account.balance - CAST(OLD.balance AS SIGNED), account.balance)) WHERE account.id=OLD.debit_id;
    END IF;

    /* Update new debit account balance */
    IF NEW.debit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('liability', 'equity', 'revenue'), account.balance - CAST(NEW.balance AS SIGNED), IF(account.type IN ('asset', 'expense'), account.balance + CAST(NEW.balance AS SIGNED), account.balance)) WHERE account.id=NEW.debit_id;
    END IF;

    /* Revert previous credit account balance */
    IF OLD.credit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('asset', 'expense'), account.balance + CAST(OLD.balance AS SIGNED), IF(account.type IN ('liability', 'equity', 'revenue'), account.balance - CAST(OLD.balance AS SIGNED), account.balance)) WHERE account.id=OLD.credit_id;
    END IF;

    /* Update new credit account balance */
    IF NEW.credit_id IS NOT NULL THEN
      UPDATE account SET account.balance=IF(account.type IN ('asset', 'expense'), account.balance - CAST(NEW.balance AS SIGNED), IF(account.type IN ('liability', 'equity', 'revenue'), account.balance + CAST(NEW.balance AS SIGNED), account.balance)) WHERE account.id=NEW.credit_id;
    END IF;
  END; //

DELIMITER ;

DELIMITER //

CREATE OR REPLACE PROCEDURE checkTransaction (IN transactionId INT) COMMENT 'Check that all transaction lines have balanced debit and credit'
  BEGIN
    DECLARE total_debit DECIMAL(7,2);
    DECLARE total_credit DECIMAL(7,2);

    SELECT SUM(IF(debit_id IS NOT NULL, tl.balance, 0)),
      SUM(IF(credit_id IS NOT NULL, tl.balance, 0))
    FROM transaction_line tl where transaction_id = transactionId
    INTO total_debit, total_credit;

    IF (total_debit != total_credit) THEN
      SELECT CONCAT('Transaction #', IFNULL(transactionId, 'new'), ' n''a pas les mêmes totaux au débit (', total_debit , ') et crédit (', total_credit ,')') into @message;
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @message;
    END IF;
  END; //

DELIMITER ;
