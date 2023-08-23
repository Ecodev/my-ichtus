import {TransactionInput, TransactionLineInput} from '../../shared/generated-types';

export interface DuplicatedTransactionResolve {
    transaction: TransactionInput;
    transactionLines: TransactionLineInput[];
}
