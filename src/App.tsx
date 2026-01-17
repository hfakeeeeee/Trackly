import { AppProvider } from './AppContext';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { Income } from './components/Income';
import { Debt } from './components/Debt';
import { Savings } from './components/Savings';
import { Bills } from './components/Bills';
import { ExpenseTracker } from './components/ExpenseTracker';
import { ExpenseChart } from './components/ExpenseChart';
import { FinancialOverviewChart } from './components/FinancialOverviewChart';
import { CategoryManager } from './components/CategoryManager';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="px-8 py-8">
          {/* Row 1: Overview + Financial Overview Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Overview />
            </div>
            <div className="lg:col-span-3">
              <FinancialOverviewChart />
            </div>
          </div>
          
          {/* Row 2: Income/Debt/Savings (40%) + Bills (60%) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Income />
              <Debt />
              <Savings />
            </div>
            <div className="lg:col-span-3 h-full">
              <Bills />
            </div>
          </div>
          
          {/* Row 3: Expense Tracker (60%) + Expense Distribution & Category Manager (40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-3">
              <ExpenseTracker />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
              <ExpenseChart />
              <CategoryManager />
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-6 py-4">
            <p className="text-center text-gray-600 text-sm">
              © 2026 Trackly - Personal Expense Tracker
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
