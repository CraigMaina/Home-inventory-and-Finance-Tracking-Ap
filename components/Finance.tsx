
import React, { useState, useMemo } from 'react';
import Card from './Card';
import { mockTransactions, mockFinanceCategories } from '../constants';
import { TransactionType, Role } from '../types';
import type { Transaction, FinanceCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';

const defaultNewTransaction: Omit<Transaction, 'transactionId'> = {
    description: '',
    amount: 0,
    type: TransactionType.Expense,
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
};

const Finance: React.FC = () => {
    const { user } = useAuth();
    const canEdit = user.role === Role.Admin || user.role === Role.Editor;

    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [categories, setCategories] = useState<FinanceCategory[]>(mockFinanceCategories);

    const [isAddTransactionModalOpen, setisAddTransactionModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

    const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'transactionId'>>(defaultNewTransaction);
    const [newCategory, setNewCategory] = useState({ name: '', type: TransactionType.Expense });

    const incomeTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.Income), [transactions]);
    const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.Expense), [transactions]);

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTransaction.description || newTransaction.amount <= 0 || !newTransaction.categoryId) {
            alert("Please fill all fields correctly.");
            return;
        }
        const newTxWithId: Transaction = {
            ...newTransaction,
            transactionId: `t${Date.now()}`
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
                                {type === TransactionType.Income ? '+' : '-'} Ksh {transaction.amount.toLocaleString()}
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

    const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <Card className="w-full max-w-md relative" title={title}>
              <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
              {children}
            </Card>
          </div>
        );
      };

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
            <button onClick={() => window.print()} className="bg-indigo-100 text-indigo-800 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70">
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
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Expense, categoryId: ''})} className={`w-1/2 py-2 text-sm font-medium rounded-l-md ${newTransaction.type === TransactionType.Expense ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>Expense</button>
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Income, categoryId: ''})} className={`w-1/2 py-2 text-sm font-medium rounded-r-md ${newTransaction.type === TransactionType.Income ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>Income</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <input type="text" id="description" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
                        <input type="number" id="amount" min="0.01" step="0.01" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
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