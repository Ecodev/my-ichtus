import {type TransactionInput, type TransactionLineInput} from '../../shared/generated-types';

export type DuplicatedTransactionResolve = {
    transaction: TransactionInput;
    transactionLines: TransactionLineInput[];
};
