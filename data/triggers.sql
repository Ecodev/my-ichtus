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

DELIMITER ~~

DROP PROCEDURE IF EXISTS update_accounts_balance;

CREATE PROCEDURE update_accounts_balance ()
BEGIN
    -- Update non-group accounts from their transactions
    DECLARE debit INT;
    DECLARE credit INT;
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE account_id BIGINT UNSIGNED;
    DECLARE cur CURSOR FOR
        SELECT id
        FROM account
        WHERE type != 'group';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;
    OPEN cur;
    updateLoop: LOOP
        FETCH cur INTO account_id;
        IF done THEN
            LEAVE updateLoop;
        END IF;

        SELECT IFNULL(SUM(balance), 0) INTO debit FROM transaction_line AS tl WHERE tl.debit_id = account_id;
        SELECT IFNULL(SUM(balance), 0) INTO credit FROM transaction_line AS tl WHERE tl.credit_id = account_id;

        UPDATE account
        SET balance = IF(
                    account.type IN ('liability', 'equity', 'revenue'),
                    credit - debit,
                    IF(
                                account.type IN ('asset', 'expense'),
                                debit - credit,
                                account.balance
                        )
            )
        WHERE account.id = account_id;
    END LOOP;
    CLOSE cur;

    -- Non group accounts always have a total balance equals to balance
    UPDATE account SET total_balance = balance WHERE type != 'group';

    -- Update total_balance for all group accounts by summing their children recursively
    UPDATE account INNER JOIN (
        WITH RECURSIVE parent AS (
            SELECT account.id, account.balance, account.id AS group_account_id
            FROM account
            WHERE type = 'group'

            UNION

            SELECT account.id, account.balance, parent.group_account_id
            FROM account
                     JOIN parent ON account.parent_id = parent.id
        )
        SELECT group_account_id, SUM(balance) AS total_balance
        FROM parent
        GROUP BY group_account_id
    ) AS computed ON account.id = computed.group_account_id
    SET account.total_balance = computed.total_balance
    WHERE type = 'group';

END ~~


DROP TRIGGER IF EXISTS transaction_DELETE;

CREATE TRIGGER transaction_DELETE
    BEFORE DELETE
    ON transaction
    FOR EACH ROW
BEGIN
    -- Manually cascade the delete so that the transaction_line trigger is activated correctly, see https://jira.mariadb.org/browse/MDEV-19402
    SET @transaction_being_deleted = OLD.id;
    DELETE FROM transaction_line WHERE transaction_id = OLD.id;
    SET @transaction_being_deleted = NULL;
END; ~~


DROP TRIGGER IF EXISTS transaction_line_INSERT;

CREATE TRIGGER transaction_line_INSERT
  AFTER INSERT
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Update debit account balance */
    IF NEW.debit_id IS NOT NULL THEN
      CALL update_account_balance(NEW.debit_id);
    END IF;

    /* Update credit account balance */
    IF NEW.credit_id IS NOT NULL THEN
        CALL update_account_balance(NEW.credit_id);
    END IF;

    /* Update transaction total */
    UPDATE transaction t
    SET t.balance=(SELECT SUM(IF(tl.debit_id IS NOT NULL, tl.balance, 0)) FROM transaction_line tl WHERE tl.transaction_id=NEW.transaction_id)
    WHERE t.id=NEW.transaction_id;
  END; ~~


DROP TRIGGER IF EXISTS transaction_line_DELETE;

CREATE TRIGGER transaction_line_DELETE
  AFTER DELETE
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Revert debit account balance */
    IF OLD.debit_id IS NOT NULL THEN
        CALL update_account_balance(OLD.debit_id);
    END IF;

    /* Revert credit account balance */
    IF OLD.credit_id IS NOT NULL THEN
        CALL update_account_balance(OLD.credit_id);
    END IF;

    /* Update transaction total */
    IF @transaction_being_deleted IS NULL THEN
        UPDATE transaction t
        SET t.balance=(SELECT SUM(IF(tl.debit_id IS NOT NULL, tl.balance, 0)) FROM transaction_line tl WHERE tl.transaction_id=OLD.transaction_id)
        WHERE t.id=OLD.transaction_id;
    END IF;
  END; ~~


DROP TRIGGER IF EXISTS transaction_line_UPDATE;

CREATE TRIGGER transaction_line_UPDATE
  AFTER UPDATE
  ON transaction_line
  FOR EACH ROW
  BEGIN
    /* Revert previous debit account balance */
    IF OLD.debit_id IS NOT NULL THEN
        CALL update_account_balance(OLD.debit_id);
    END IF;

    /* Update new debit account balance */
    IF NEW.debit_id IS NOT NULL THEN
        CALL update_account_balance(NEW.debit_id);
    END IF;

    /* Revert previous credit account balance */
    IF OLD.credit_id IS NOT NULL THEN
        CALL update_account_balance(OLD.credit_id);
    END IF;

    /* Update new credit account balance */
    IF NEW.credit_id IS NOT NULL THEN
        CALL update_account_balance(NEW.credit_id);
    END IF;

    /* Update transaction total */
    UPDATE transaction t
    SET t.balance=(SELECT SUM(IF(tl.debit_id IS NOT NULL, tl.balance, 0)) FROM transaction_line tl WHERE tl.transaction_id=NEW.transaction_id)
    WHERE t.id=NEW.transaction_id;
  END; ~~


DROP PROCEDURE IF EXISTS checkTransaction;

CREATE PROCEDURE checkTransaction (IN transactionId INT) COMMENT 'Check that all transaction lines have balanced debit and credit'
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
  END; ~~

DELIMITER ;
