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
import { Footer } from './components/Footer';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen text-ink-900 dark:text-ink-100">
        <Header />
        <main className="px-2 pb-16 pt-8 sm:px-4 lg:px-6">
          <div className="mx-auto max-w-screen-2xl animate-rise-in">
            {/* Row 1: Overview + Financial Overview Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 animate-rise-in">
              <div className="lg:col-span-5">
                <Overview />
              </div>
              <div className="lg:col-span-7">
                <FinancialOverviewChart />
              </div>
            </div>

            {/* Row 2: Income/Debt/Savings (40%) + Bills (60%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 animate-rise-in anim-delay-200">
              <div className="lg:col-span-5 flex flex-col gap-6">
                <Income />
                <Debt />
                <Savings />
              </div>
              <div className="lg:col-span-7 h-full">
                <Bills />
              </div>
            </div>

            {/* Row 3: Expense Tracker (60%) + Expense Distribution & Category Manager (40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 animate-rise-in anim-delay-300">
              <div className="lg:col-span-3">
                <ExpenseTracker />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                <ExpenseChart />
                <div className="flex-1">
                  <CategoryManager />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
