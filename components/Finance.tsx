
import React, { useState, useMemo } from 'react';
import Card from './Card';
import Modal from './Modal';
import { TransactionType, Role } from '../types';
import type { Transaction, FinanceCategory, Bill } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface FinanceProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    categories: FinanceCategory[];
    setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
    bills: Bill[];
}

const defaultNewTransaction: Omit<Transaction, 'transactionId' | 'amount'> & { amount: string } = {
    description: '',
    amount: '',
    type: TransactionType.Expense,
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
    billId: undefined,
};

const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, categories, setCategories, bills }) => {
    const { user } = useAuth();
    const canEdit = user.role === Role.Admin || user.role === Role.Editor;

    const [isAddTransactionModalOpen, setisAddTransactionModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

    const [newTransaction, setNewTransaction] = useState(defaultNewTransaction);
    const [newCategory, setNewCategory] = useState({ name: '', type: TransactionType.Expense });

    const incomeTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.Income), [transactions]);
    const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.Expense), [transactions]);

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const amountValue = parseFloat(newTransaction.amount) || 0;
        if (!newTransaction.description || amountValue <= 0 || !newTransaction.categoryId) {
            alert("Please fill all fields correctly.");
            return;
        }
        const newTxWithId: Transaction = {
            description: newTransaction.description,
            type: newTransaction.type,
            date: newTransaction.date,
            categoryId: newTransaction.categoryId,
            amount: Math.round(amountValue * 100),
            transactionId: `t${Date.now()}`,
            billId: newTransaction.billId
        };
        setTransactions(prev => [newTxWithId, ...prev]);
        setNewTransaction(defaultNewTransaction);
        setisAddTransactionModalOpen(false);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name.trim()) {
            alert("Please enter a category name.");
            return;
        }
        const newCatWithId: FinanceCategory = {
            ...newCategory,
            categoryId: `fc${Date.now()}`
        };
        setCategories(prev => [...prev, newCatWithId]);
        setNewCategory({ name: '', type: TransactionType.Expense });
        setIsAddCategoryModalOpen(false);
    };

    const handleBillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const billId = e.target.value || undefined;
        const selectedBill = bills.find(b => b.billId === billId);

        if (selectedBill) {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            const amountPaid = transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return t.billId === selectedBill.billId &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            
            const remainingAmount = selectedBill.amount - amountPaid;

            setNewTransaction({
                ...newTransaction,
                billId: selectedBill.billId,
                categoryId: selectedBill.categoryId,
                amount: Math.max(0, remainingAmount / 100).toFixed(2),
                description: newTransaction.description || `Payment for ${selectedBill.name}`,
            });
        } else {
            setNewTransaction({
                ...newTransaction,
                billId: undefined,
            });
        }
    };

    const handlePrintReport = () => {
        const generateTableHTML = (title: string, tableTransactions: Transaction[], type: TransactionType) => {
            if (tableTransactions.length === 0) {
                return `<h2 class="text-2xl font-semibold mb-2 mt-6">${title}</h2><p class="text-slate-500">No ${type} transactions recorded.</p>`;
            }

            const rows = tableTransactions.map(transaction => {
                const category = categories.find(c => c.categoryId === transaction.categoryId);
                const amount = (transaction.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const sign = type === TransactionType.Income ? '+' : '-';
                const amountClass = type === TransactionType.Income ? 'text-green-600' : 'text-red-600';
                
                return `
                    <tr>
                        <td class="px-4 py-3 border">${transaction.description}</td>
                        <td class="px-4 py-3 border">${category?.name || 'Uncategorized'}</td>
                        <td class="px-4 py-3 border">${new Date(transaction.date).toLocaleDateString()}</td>
                        <td class="px-4 py-3 border text-right font-medium ${amountClass}">${sign} Ksh ${amount}</td>
                    </tr>
                `;
            }).join('');

            return `
                <h2 class="text-2xl font-semibold mb-3 mt-8">${title}</h2>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 border-b-2 font-bold bg-slate-50">Description</th>
                            <th class="px-4 py-2 border-b-2 font-bold bg-slate-50">Category</th>
                            <th class="px-4 py-2 border-b-2 font-bold bg-slate-50">Date</th>
                            <th class="px-4 py-2 border-b-2 font-bold text-right bg-slate-50">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;
        };

        const incomeTableHTML = generateTableHTML('Income', incomeTransactions, TransactionType.Income);
        const expenseTableHTML = generateTableHTML('Expenses', expenseTransactions, TransactionType.Expense);

        const reportContent = incomeTableHTML + expenseTableHTML;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the report.');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Financial Report</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="p-8 font-sans">
                    <h1 class="text-4xl font-bold mb-2 text-slate-800">Financial Report</h1>
                    <p class="text-slate-500 mb-8">Generated on: ${new Date().toLocaleDateString()}</p>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };
    
    const TransactionTable: React.FC<{ transactions: Transaction[], title: string, type: TransactionType }> = ({ transactions, title, type }) => (
        <Card title={title}>
            <div className="overflow-x-auto">
                {transactions.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 print:divide-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700 print:bg-transparent">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 print:text-black">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 print:text-black">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 print:text-black">Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 print:text-black">Amount</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700 print:bg-transparent print:divide-slate-300">
                    {transactions.map((transaction) => {
                        const category = categories.find(c => c.categoryId === transaction.categoryId);
                        return (
                        <tr key={transaction.transactionId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200 print:text-black">{transaction.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 print:bg-transparent print:border print:border-slate-300 print:text-black">
                                {category?.name || 'Uncategorized'}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 print:text-black">{new Date(transaction.date).toLocaleDateString()}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${type === TransactionType.Income ? 'text-green-500' : 'text-red-500'} print:!text-black`}>
                                {type === TransactionType.Income ? '+' : '-'} Ksh {(transaction.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                        )
                    })}
                    </tbody>
                </table>
                 ) : (
                    <p className="text-center text-slate-500 py-4 dark:text-slate-400">No {type} transactions yet.</p>
                )}
            </div>
        </Card>
    );

  return (
    <div className="space-y-6">
       <div className="hidden print:block mb-4 p-4">
            <h1 className="text-3xl font-bold text-slate-800">Financial Report</h1>
            <p className="text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Financial Overview</h1>
        <div className="flex items-center gap-2">
            {canEdit && (
                <>
                <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    Add New Category
                </button>
                <button onClick={() => setisAddTransactionModalOpen(true)} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                    Add New Transaction
                </button>
                </>
            )}
            <button onClick={handlePrintReport} className="bg-indigo-100 text-indigo-800 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70">
                Print Report
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionTable transactions={incomeTransactions} title="Income" type={TransactionType.Income} />
        <TransactionTable transactions={expenseTransactions} title="Expenses" type={TransactionType.Expense} />
      </div>
      <div className='print:hidden'>
       <Modal isOpen={isAddTransactionModalOpen} onClose={() => setisAddTransactionModalOpen(false)} title="Add New Transaction">
            <form onSubmit={handleAddTransaction} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Expense, categoryId: '', billId: undefined})} className={`w-1/2 py-2 text-sm font-medium rounded-l-md ${newTransaction.type === TransactionType.Expense ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>Expense</button>
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Income, categoryId: '', billId: undefined})} className={`w-1/2 py-2 text-sm font-medium rounded-r-md ${newTransaction.type === TransactionType.Income ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>Income</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <input type="text" id="description" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                        <input type="text" id="amount" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="0.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                        <input type="date" id="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <select id="category" value={newTransaction.categoryId} onChange={e => setNewTransaction({...newTransaction, categoryId: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                        <option value="" disabled>Select a category</option>
                        {categories.filter(c => c.type === newTransaction.type).map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                    </select>
                </div>
                {newTransaction.type === TransactionType.Expense && (
                    <div>
                        <label htmlFor="bill" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Link to a Bill (Optional)</label>
                        <select id="bill" value={newTransaction.billId || ''} onChange={handleBillChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option value="">Not a bill payment</option>
                            {bills.map(bill => (
                                <option key={bill.billId} value={bill.billId}>{bill.name} (Due: {bill.dueDate}{getOrdinalSuffix(bill.dueDate)})</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setisAddTransactionModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">Add Transaction</button>
                </div>
            </form>
       </Modal>

        <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Category">
            <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name</label>
                    <input type="text" id="categoryName" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <select value={newCategory.type} onChange={e => setNewCategory({...newCategory, type: e.target.value as TransactionType})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                        <option value={TransactionType.Expense}>Expense</option>
                        <option value={TransactionType.Income}>Income</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">Add Category</button>
                </div>
            </form>
        </Modal>
    </div>
    </div>
  );
};

export default Finance;
