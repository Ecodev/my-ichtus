import {Transaction, TransactionLine} from '../../shared/generated-types';

export interface TransactionLineResolve {
    model: TransactionLine['transactionLine'];
}

export interface TransactionResolve {
    model: Transaction['transaction'];
}
