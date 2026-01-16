# Trackly - Personal Expense Tracker

A modern, feature-rich expense tracking web application built with React, TypeScript, and Vite.

## Features

### 📊 Comprehensive Financial Overview
- **Header Dashboard**: Quick view of current month, total income, savings, and remaining balance
- **Period Management**: Customizable start and end dates with automatic calculations
- **Smart Analytics**: Days remaining and daily spending allowance calculator

### 💰 Income & Expense Management
- **Income Tracking**: Record and manage all income sources
- **Savings Goals**: Track savings separately from available spending money
- **Debt Management**: Keep track of debts with due dates
- **Bill Reminders**: Manage recurring bills with payment dates

### 📝 Detailed Expense Tracking
- **Transaction Log**: Record every expense with date, amount, description, and category
- **Category System**: Pre-defined categories (Food & Dining, Transportation, Shopping, etc.)
- **Custom Categories**: Add your own expense categories
- **Automatic Totals**: Real-time calculation of spending by category

### 📈 Visual Analytics
- **Pie Chart Visualization**: Beautiful chart showing expense distribution by category
- **Real-time Updates**: All charts and totals update automatically

### 💾 Data Persistence
- **Local Storage**: All your data is saved locally in your browser
- **No Backend Required**: Works completely offline after initial load

## Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Powerful charting library
- **date-fns** - Modern date utility library

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd Trackly
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Setting Up Your Period
1. Set your start and end dates in the Overview section
2. The app will calculate days remaining and daily allowance automatically

### Adding Income
1. Go to the Income section
2. Enter description and amount
3. Click "Add Income"

### Recording Expenses
1. Navigate to the Expense Tracker section
2. Select date, enter amount and description
3. Choose a category or create a new one
4. Click "Add Expense"

### Managing Categories
1. In the Expense Tracker section, find the Categories panel
2. Click "+ Add" to create custom categories
3. View total spending per category in real-time

### Viewing Analytics
- Check the Expense Chart section for visual breakdown
- Monitor your spending patterns by category
- Use insights to adjust your budget

## Project Structure

```
Trackly/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top dashboard
│   │   ├── Overview.tsx        # Period settings and calculations
│   │   ├── Income.tsx          # Income management
│   │   ├── Debt.tsx           # Debt tracking
│   │   ├── Savings.tsx        # Savings tracking
│   │   ├── Bills.tsx          # Bill management
│   │   ├── ExpenseTracker.tsx # Expense recording
│   │   └── ExpenseChart.tsx   # Visual analytics
│   ├── AppContext.tsx          # Global state management
│   ├── types.ts               # TypeScript definitions
│   ├── App.tsx                # Main application
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Features in Detail

### Smart Calculations
- **Remaining Amount**: Income - Savings - Total Expenses
- **Daily Allowance**: Remaining Amount ÷ Days Until End Date
- **Category Totals**: Automatic aggregation of expenses by category

### Data Management
- All data persists in browser's localStorage
- Automatic save on every change
- No data sent to external servers

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for tablets and desktops
- Touch-optimized controls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Support

For questions or issues, please open an issue on the GitHub repository.

---

Built with ❤️ using React + TypeScript + Vite
