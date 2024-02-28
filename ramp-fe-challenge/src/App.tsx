import { appendFile } from "fs";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee, Transaction } from "./utils/types";

export function App() {
  const { data: employees, loading: employeesLoading, ...employeeUtils } = useEmployees();
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false);

  const [inputKey, setInputKey] = useState(0); // Key to force re-render of InputSelect

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    transactionsByEmployeeUtils.invalidateData();

    await employeeUtils.fetchAll();
    await paginatedTransactionsUtils.fetchAll();

    setIsLoading(false);
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData();
      await transactionsByEmployeeUtils.fetchById(employeeId);
      setSelectedEmployeeId(employeeId); // Update the selected employee ID
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    const moreDataAvailable = typeof paginatedTransactions?.nextPage !== 'undefined';
    setHasMoreTransactions(moreDataAvailable);
  }, [paginatedTransactions]);

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions();
    }
  }, [employeesLoading, employees, loadAllTransactions]);

  // Scroll event listener to force InputSelect re-render
  useEffect(() => {
    const handleScroll = () => {
      setInputKey(prevKey => prevKey + 1); // Change key to force re-render
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Do something with selectedEmployeeId if needed
  useEffect(() => {
    console.log("Selected employee ID:", selectedEmployeeId);
  }, [selectedEmployeeId]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />
        <hr className="RampBreak--l" />
        <InputSelect<Employee>
          key={inputKey} // Use key to force re-render
          isLoading={employeesLoading} // Use the employeesLoading state here
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return;
            }
            if (newValue.id === "") {
              setIsFilteredByEmployee(false);
              setSelectedEmployeeId(null); // Reset the selected employee ID
              await loadAllTransactions(); // Load all transactions
            } else {
              setIsFilteredByEmployee(true);
              await loadTransactionsByEmployee(newValue.id); // Load transactions by selected employee
            }
          }}
        />
        <div className="RampBreak--l" />
        <div className="RampGrid">
          <Transactions transactions={transactions} />
          {!isFilteredByEmployee && (hasMoreTransactions || (employees && employees.length > 0)) && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
