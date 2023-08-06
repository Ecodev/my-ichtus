import {Transaction, TransactionInput, TransactionLineInput} from '../../shared/generated-types';

export interface TransactionResolve {
    model: Transaction['transaction'];
}

export interface DuplicatedTransactionResolve {
    transaction: TransactionInput;
    transactionLines: TransactionLineInput[];
}
