import { useCallback, useState } from "react";
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types";
import { PaginatedTransactionsResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";


export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null);

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions?.nextPage ?? 0,
      }
    );

    setPaginatedTransactions((previousResponse) => {
      if (response === null || response.data === null) {
        return previousResponse;
      }

      if (previousResponse === null) {
        return response;
      }

      // Assuming each transaction has a unique identifier. Adjust 't.id' to your actual identifier property.
      const existingIds = new Set(previousResponse.data.map(t => t.id));
      const filteredNewTransactions = response.data.filter(t => !existingIds.has(t.id));

      return {
        ...response,
        data: [...previousResponse.data, ...filteredNewTransactions],
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null);
  }, []);

  // Determine if there are more transactions available based on the presence of nextPage
  const hasMoreTransactions = !!paginatedTransactions?.nextPage;

  return { data: paginatedTransactions, loading, fetchAll, invalidateData, hasMoreTransactions };
}
