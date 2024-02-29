import {TransactionInput, TransactionLineInput} from '../../shared/generated-types';

export type DuplicatedTransactionResolve = {
    transaction: TransactionInput;
    transactionLines: TransactionLineInput[];
};
