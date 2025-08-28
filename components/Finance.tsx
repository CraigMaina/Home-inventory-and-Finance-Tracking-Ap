import React, { useState, useMemo } from 'react';
import Card from './Card';
import { mockTransactions, mockFinanceCategories } from '../constants';
import { TransactionType } from '../types';
import type { Transaction, FinanceCategory } from '../types';

const defaultNewTransaction: Omit<Transaction, 'transactionId'> = {
    description: '',
    amount: 0,
    type: TransactionType.Expense,
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
};

const Finance: React.FC = () => {
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
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                    {transactions.map((transaction) => {
                        const category = categories.find(c => c.categoryId === transaction.categoryId);
                        return (
                        <tr key={transaction.transactionId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{transaction.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                                {category?.name || 'Uncategorized'}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                {type === TransactionType.Income ? '+' : '-'} ${transaction.amount.toFixed(2)}
                            </td>
                        </tr>
                        )
                    })}
                    </tbody>
                </table>
                 ) : (
                    <p className="text-center text-slate-500 py-4">No {type} transactions yet.</p>
                )}
            </div>
        </Card>
    );

    const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-md relative" title={title}>
              <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold text-slate-500 hover:text-slate-800">&times;</button>
              {children}
            </Card>
          </div>
        );
      };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Financial Overview</h1>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                Add New Category
            </button>
            <button onClick={() => setisAddTransactionModalOpen(true)} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
            Add New Transaction
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionTable transactions={incomeTransactions} title="Income" type={TransactionType.Income} />
        <TransactionTable transactions={expenseTransactions} title="Expenses" type={TransactionType.Expense} />
      </div>

       <Modal isOpen={isAddTransactionModalOpen} onClose={() => setisAddTransactionModalOpen(false)} title="Add New Transaction">
            <form onSubmit={handleAddTransaction} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Type</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Expense, categoryId: ''})} className={`w-1/2 py-2 text-sm font-medium rounded-l-md ${newTransaction.type === TransactionType.Expense ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>Expense</button>
                        <button type="button" onClick={() => setNewTransaction({...newTransaction, type: TransactionType.Income, categoryId: ''})} className={`w-1/2 py-2 text-sm font-medium rounded-r-md ${newTransaction.type === TransactionType.Income ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>Income</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                    <input type="text" id="description" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
                        <input type="number" id="amount" min="0.01" step="0.01" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
                        <input type="date" id="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                    <select id="category" value={newTransaction.categoryId} onChange={e => setNewTransaction({...newTransaction, categoryId: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="" disabled>Select a category</option>
                        {categories.filter(c => c.type === newTransaction.type).map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">Add Transaction</button>
                </div>
            </form>
       </Modal>

        <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Category">
            <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700">Category Name</label>
                    <input type="text" id="categoryName" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Type</label>
                    <select value={newCategory.type} onChange={e => setNewCategory({...newCategory, type: e.target.value as TransactionType})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value={TransactionType.Expense}>Expense</option>
                        <option value={TransactionType.Income}>Income</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">Add Category</button>
                </div>
            </form>
        </Modal>

    </div>
  );
};

export default Finance;