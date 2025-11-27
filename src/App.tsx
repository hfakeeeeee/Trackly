import { useBudgetData } from './hooks/useBudgetData';
import {
  Header,
  OverviewSection,
  IncomeSection,
  DebtSection,
  BillsSection,
  SavingsSection,
  ExpenseTrackerSection,
  CategorySection,
  CategoryPieChart
} from './components';

function App() {
  const {
    data,
    updateIncome,
    updateDebts,
    updateBills,
    updateSavings,
    updateExpenseTracker,
    updateCategories,
    updateSettings
  } = useBudgetData();

  // Calculate totals
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalDebts = data.debts.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = data.bills.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenseTracker = data.expenseTracker.reduce((sum, item) => sum + item.amount, 0);
  
  const totalSpent = totalDebts + totalBills + totalExpenseTracker;
  const leftOver = totalIncome - totalSpent - totalSavings;

  // Category breakdown for pie chart
  const categoryTotals: { [key: string]: number } = {};
  
  data.expenseTracker.forEach(item => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }
    categoryTotals[item.category] += item.amount;
  });

  const categoryBreakdown = Object.entries(categoryTotals).map(([label, value]) => {
    const category = data.categories?.find(c => c.name === label);
    return {
      label,
      value,
      percentage: totalExpenseTracker > 0 ? (value / totalExpenseTracker) * 100 : 0,
      color: category?.color || '#6b7280'
    };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header with Summary Cards */}
        <Header
          month="NOVEMBER"
          income={totalIncome}
          totalSpent={totalSpent}
          savings={totalSavings}
          leftOver={leftOver}
          currency={data.settings.currency}
        />

        {/* Overview + Bills Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OverviewSection 
            settings={data.settings}
            leftOver={leftOver}
            updateSettings={updateSettings}
          />
          
          <BillsSection 
            bills={data.bills}
            updateBills={updateBills}
            currency={data.settings.currency}
          />
        </div>

        {/* Income + Savings + Debt Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <IncomeSection 
            income={data.income}
            updateIncome={updateIncome}
            currency={data.settings.currency}
          />
          
          <SavingsSection 
            savings={data.savings}
            updateSavings={updateSavings}
            currency={data.settings.currency}
          />
          
          <DebtSection 
            debts={data.debts}
            updateDebts={updateDebts}
            currency={data.settings.currency}
          />
        </div>

        {/* Expense Tracker (70%) + Categories & Breakdown (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Expense Tracker - 70% width */}
          <div className="lg:col-span-7">
            <ExpenseTrackerSection 
              expenses={data.expenseTracker}
              updateExpenses={updateExpenseTracker}
              categories={data.categories || []}
              currency={data.settings.currency}
            />
          </div>
          
          {/* Categories + Breakdown - 30% width */}
          <div className="lg:col-span-3 space-y-6">
            <CategorySection 
              categories={data.categories || []}
              onUpdateCategories={updateCategories}
            />
            
            {categoryBreakdown.length > 0 && (
              <CategoryPieChart categories={categoryBreakdown} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
