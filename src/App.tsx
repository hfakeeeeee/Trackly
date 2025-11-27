import { useBudgetData } from './hooks/useBudgetData';
import {
  Header,
  OverviewSection,
  CashFlowSection,
  IncomeSection,
  DebtSection,
  BillsSection,
  ExpensesSection,
  SavingsSection,
  ExpenseTrackerSection,
  BudgetChart,
  CategoryPieChart
} from './components';

function App() {
  const {
    data,
    updateIncome,
    updateDebts,
    updateBills,
    updateExpenses,
    updateSavings,
    updateExpenseTracker,
    updateSettings
  } = useBudgetData();

  // Calculate totals
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalDebts = data.debts.reduce((sum, item) => sum + item.paid, 0);
  const totalBills = data.bills.reduce((sum, item) => sum + item.actual, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.actual, 0);
  const totalSavings = data.savings.reduce((sum, item) => sum + item.actual, 0);
  
  const debtsBudget = data.debts.reduce((sum, item) => sum + item.budget, 0);
  const billsBudget = data.bills.reduce((sum, item) => sum + item.budget, 0);
  const expensesBudget = data.expenses.reduce((sum, item) => sum + item.budget, 0);
  const savingsBudget = data.savings.reduce((sum, item) => sum + item.budget, 0);

  const totalBudget = debtsBudget + billsBudget + expensesBudget + savingsBudget;
  const totalActual = totalDebts + totalBills + totalExpenses + totalSavings;
  const leftToBudget = totalIncome - totalBudget;
  const leftOver = totalIncome - totalActual;
  const spentPercentage = totalIncome > 0 ? Math.round((totalActual / totalIncome) * 100) : 0;

  // Category breakdown for pie chart
  const categoryTotals: { [key: string]: number } = {};
  let trackerTotal = 0;
  
  data.expenseTracker.forEach(item => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }
    categoryTotals[item.category] += item.amount;
    trackerTotal += item.amount;
  });

  const categoryBreakdown = Object.entries(categoryTotals).map(([label, value]) => ({
    label,
    value,
    percentage: trackerTotal > 0 ? (value / trackerTotal) * 100 : 0
  })).sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <Header
          month="NOVEMBER"
          budgeted={totalBudget}
          leftToBudget={leftToBudget}
          income={totalIncome}
          totalSpent={totalActual}
          savings={totalSavings}
          leftOver={leftOver}
          spentPercentage={spentPercentage}
          currency={data.settings.currency}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            <OverviewSection 
              settings={data.settings}
              leftOver={leftOver}
              updateSettings={updateSettings}
            />
            <CashFlowSection
              debts={{ budget: debtsBudget, actual: totalDebts }}
              savings={{ budget: savingsBudget, actual: totalSavings }}
              bills={{ budget: billsBudget, actual: totalBills }}
              expenses={{ budget: expensesBudget, actual: totalExpenses }}
              total={{ budget: totalBudget, actual: totalActual }}
              currency={data.settings.currency}
            />
            <IncomeSection 
              income={data.income}
              updateIncome={updateIncome}
              currency={data.settings.currency}
            />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <BudgetChart 
              data={{
                debts: { budget: debtsBudget, actual: totalDebts },
                savings: { budget: savingsBudget, actual: totalSavings },
                bills: { budget: billsBudget, actual: totalBills },
                expenses: { budget: expensesBudget, actual: totalExpenses }
              }}
            />
            <BillsSection 
              bills={data.bills}
              updateBills={updateBills}
              currency={data.settings.currency}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CategoryPieChart categories={categoryBreakdown} />
            <ExpensesSection 
              expenses={data.expenses}
              updateExpenses={updateExpenses}
              currency={data.settings.currency}
            />
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DebtSection 
            debts={data.debts}
            updateDebts={updateDebts}
            currency={data.settings.currency}
          />
          <SavingsSection 
            savings={data.savings}
            updateSavings={updateSavings}
            currency={data.settings.currency}
          />
        </div>

        {/* Expense Tracker */}
        <ExpenseTrackerSection 
          expenses={data.expenseTracker}
          updateExpenses={updateExpenseTracker}
          currency={data.settings.currency}
          categoryBreakdown={categoryBreakdown}
        />
      </div>
    </div>
  );
}

export default App;
