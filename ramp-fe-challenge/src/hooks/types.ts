import { Employee, PaginatedResponse, Transaction } from "../utils/types"

type UseTypeBaseResult<TValue> = {
  data: TValue
  loading: boolean
  invalidateData: () => void
}

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>
}

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>
}

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null>

export interface PaginatedTransactionsResult extends UseTypeBaseAllResult<PaginatedResponse<Transaction[]> | null> {
  hasMoreTransactions: boolean; // Add hasMoreTransactions here
}

export type TransactionsByEmployeeResult = UseTypeBaseByIdResult<Transaction[] | null>


