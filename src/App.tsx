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
import { ThemeWipe } from './components/ThemeWipe';
import { useApp } from './AppContext';
import { AuthScreen } from './components/AuthScreen';

function AppContent() {
  const { themeTransitionId, user, authLoading, dataLoading } = useApp();

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-sand-50 text-ink-900 flex items-center justify-center overflow-hidden">
        <style>
          {`
            @keyframes fly-1 {
              0% { transform: translate(0, 0) rotate(-6deg); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: translate(140px, -110px) rotate(18deg); opacity: 0; }
            }
            @keyframes fly-2 {
              0% { transform: translate(0, 0) rotate(8deg); opacity: 0; }
              15% { opacity: 1; }
              100% { transform: translate(180px, -60px) rotate(-12deg); opacity: 0; }
            }
            @keyframes fly-3 {
              0% { transform: translate(0, 0) rotate(12deg); opacity: 0; }
              25% { opacity: 1; }
              100% { transform: translate(120px, -160px) rotate(24deg); opacity: 0; }
            }
            @keyframes coin-arc {
              0% { transform: translate(0, 0) scale(0.9); opacity: 0; }
              30% { opacity: 1; }
              100% { transform: translate(110px, -140px) scale(1.05); opacity: 0; }
            }
          `}
        </style>
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-teal-300/20 blur-[140px] animate-slow-float" />
          <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-amber-200/25 blur-[160px] animate-slow-float" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
        </div>
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative h-44 w-72 sm:w-96">
            <div className="absolute inset-0 rounded-3xl border border-ink-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.15)]" />

            <div className="absolute left-10 bottom-8 h-20 w-44 rounded-2xl bg-sand-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.15)]">
              <div className="absolute -top-5 left-6 h-10 w-32 rounded-xl bg-sand-100/90 rotate-[-6deg] origin-left" />
              <div className="absolute -top-4 right-4 h-10 w-20 rounded-xl bg-sand-100/80 rotate-[8deg]" />
              <div className="absolute right-6 top-2 h-4 w-4 rounded-full bg-amber-300/90 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </div>

            <div className="absolute left-24 top-8 h-8 w-14 rotate-[-8deg] rounded-lg bg-emerald-400/90 shadow-[0_0_18px_rgba(52,211,153,0.55)] [animation:fly-1_2.2s_infinite]" />
            <div className="absolute left-48 top-6 h-7 w-12 rotate-[12deg] rounded-lg bg-emerald-300/90 shadow-[0_0_16px_rgba(110,231,183,0.5)] [animation:fly-2_2.6s_infinite]" />
            <div className="absolute left-60 top-16 h-6 w-10 rotate-[20deg] rounded-lg bg-emerald-200/90 shadow-[0_0_14px_rgba(110,231,183,0.45)] [animation:fly-3_2.8s_infinite]" />

            <div className="absolute left-44 top-2 h-5 w-5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)] [animation:coin-arc_2.4s_infinite]" />
            <div className="absolute left-56 top-10 h-4 w-4 rounded-full bg-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.55)] [animation:coin-arc_2.8s_infinite]" />
            <div className="absolute left-36 top-18 h-3.5 w-3.5 rounded-full bg-teal-300 shadow-[0_0_14px_rgba(20,184,166,0.55)] [animation:coin-arc_3s_infinite]" />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-ink-500 animate-pulse">Loading</p>
            <p className="mt-2 text-sm text-ink-600">Checking your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen text-ink-900 dark:text-ink-100">
      <ThemeWipe transitionId={themeTransitionId} />
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
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
