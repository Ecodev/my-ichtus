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

# Update balance of accounts and all its parents:
#
# - If account_id = 0, for ALL accounts
# - If account_id > 0, for that account
# - If account_id = NULL, do nothing at all
CREATE OR REPLACE PROCEDURE update_account_balance (IN account_id INT)
this_procedure:BEGIN
    -- Update non-group accounts from their transactions
    DECLARE debit INT;
    DECLARE credit INT;
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE _id BIGINT UNSIGNED;
    DECLARE cur CURSOR FOR
        SELECT id
        FROM account
        WHERE account_id = 0 AND type != 'group' OR id = account_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done := TRUE;

    IF(account_id IS NULL) THEN
        LEAVE this_procedure;
    END IF;

    OPEN cur;
    updateLoop: LOOP
        FETCH cur INTO _id;
        IF done THEN
            LEAVE updateLoop;
        END IF;

        SELECT IFNULL(SUM(balance), 0) INTO debit FROM transaction_line AS tl WHERE tl.debit_id = _id;
        SELECT IFNULL(SUM(balance), 0) INTO credit FROM transaction_line AS tl WHERE tl.credit_id = _id;

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
        WHERE account.id = _id;
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

-- Update balance of a single transaction
CREATE OR REPLACE PROCEDURE update_transaction_balance (IN transaction_id INT)
BEGIN
    UPDATE transaction
    SET transaction.balance = (SELECT SUM(IF(tl.debit_id IS NOT NULL, tl.balance, 0)) FROM transaction_line tl WHERE tl.transaction_id = transaction_id)
    WHERE transaction.id = transaction_id;
END ~~

# Update account balance but only if needed. So if the transaction_line balance was updated,
# then update both accounts. Or if the one of the account was updated, then update the updated account
CREATE OR REPLACE PROCEDURE maybe_update_account_balance (old_balance INT, new_balance INT, old_account INT, new_account INT)
BEGIN
    DECLARE balance_updated BOOL;
    DECLARE account_updated BOOL;

    SELECT old_balance != new_balance INTO balance_updated;
    SELECT IFNULL(old_account, -1) != IFNULL(new_account, -1) INTO account_updated;

    IF balance_updated OR account_updated THEN
        CALL update_account_balance(old_account);
    END IF;

    IF account_updated THEN
        CALL update_account_balance(new_account);
    END IF;
END ~~

CREATE OR REPLACE TRIGGER transaction_DELETE
    BEFORE DELETE
    ON transaction
    FOR EACH ROW
this_trigger:BEGIN
    IF @disable_triggers IS NOT NULL THEN
        LEAVE this_trigger;
    END IF;

    -- Manually cascade the delete so that the transaction_line trigger is activated correctly, see https://jira.mariadb.org/browse/MDEV-19402
    SET @transaction_being_deleted = OLD.id;
    DELETE FROM transaction_line WHERE transaction_id = OLD.id;
    SET @transaction_being_deleted = NULL;
END; ~~


CREATE OR REPLACE TRIGGER transaction_line_INSERT
  AFTER INSERT
  ON transaction_line
  FOR EACH ROW
this_trigger:BEGIN
    IF @disable_triggers IS NOT NULL OR @disable_triggers_for_mass_transaction_line IS NOT NULL THEN
        LEAVE this_trigger;
    END IF;

    /* Update debit account balance */
    CALL update_account_balance(NEW.debit_id);

    /* Update credit account balance */
    CALL update_account_balance(NEW.credit_id);

    /* Update transaction total */
    CALL update_transaction_balance(NEW.transaction_id);
  END; ~~


CREATE OR REPLACE TRIGGER transaction_line_DELETE
  AFTER DELETE
  ON transaction_line
  FOR EACH ROW
this_trigger:BEGIN
    IF @disable_triggers IS NOT NULL OR @disable_triggers_for_mass_transaction_line IS NOT NULL THEN
        LEAVE this_trigger;
    END IF;

    /* Revert debit account balance */
    CALL update_account_balance(OLD.debit_id);

    /* Revert credit account balance */
    CALL update_account_balance(OLD.credit_id);

    /* Update transaction total */
    IF @transaction_being_deleted IS NULL THEN
        CALL update_transaction_balance(OLD.transaction_id);
    END IF;
  END; ~~


CREATE OR REPLACE TRIGGER transaction_line_UPDATE
  AFTER UPDATE
  ON transaction_line
  FOR EACH ROW
this_trigger:BEGIN
    IF @disable_triggers IS NOT NULL OR @disable_triggers_for_mass_transaction_line IS NOT NULL THEN
        LEAVE this_trigger;
    END IF;

    /* Update new credit account balance */
    CALL maybe_update_account_balance(OLD.balance, NEW.balance, OLD.debit_id, NEW.debit_id);

    # If we only swapped the two accounts, then we don't need to re-update both of them again
    IF NOT (NEW.debit_id = OLD.credit_id AND NEW.credit_id = OLD.debit_id) THEN
        CALL maybe_update_account_balance(OLD.balance, NEW.balance, OLD.credit_id, NEW.credit_id);
    END IF;

    /* Update transaction total */
    IF OLD.balance != NEW.balance THEN
        CALL update_transaction_balance(NEW.transaction_id);
    END IF;
  END; ~~
