import React from 'react';
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
        <main className="container mx-auto px-6 py-8">
          {/* Row 1: Overview + Financial Overview Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Overview />
            <FinancialOverviewChart />
          </div>
          
          {/* Row 2: Income + Bills + Debt */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Income />
            <Bills />
            <Debt />
          </div>
          
          {/* Row 3: Savings + Expense Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Savings />
            <ExpenseChart />
          </div>
          
          {/* Row 4: Expense Tracker + Category Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ExpenseTracker />
            </div>
            <div className="lg:col-span-1">
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
