
import React, { useState, useMemo, useCallback } from 'react';
import Card from './Card';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { Role, TransactionType } from '../types';
import type { Bill, Transaction, FinanceCategory } from '../types';
import { EditIcon, TrashIcon, ClockIcon } from '../icons/IconComponents';

const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

type BillFormState = {
    name: string;
    amount: string;
    dueDate: string;
    categoryId: string;
};

interface BillsProps {
    bills: Bill[];
    setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    financeCategories: FinanceCategory[];
}

const Bills: React.FC<BillsProps> = ({ bills, setBills, transactions, setTransactions, financeCategories }) => {
    const { user } = useAuth();
    const canEdit = user.role === Role.Admin || user.role === Role.Editor;
    
    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'payment' | 'delete' | 'history' | null, bill: Bill | null }>({ type: null, bill: null });
    const [billForm, setBillForm] = useState<BillFormState>({ name: '', amount: '', dueDate: '', categoryId: '' });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const getPaymentStatus = useCallback((bill: Bill) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const amountPaid = transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.billId === bill.billId &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const progress = bill.amount > 0 ? (amountPaid / bill.amount) * 100 : 100;
        
        return {
            amountPaid,
            isPaid: amountPaid >= bill.amount,
            progress: Math.min(progress, 100),
            remaining: bill.amount - amountPaid
        };
    }, [transactions]);

    const sortedBills = useMemo(() => {
        return [...bills].sort((a, b) => a.dueDate - b.dueDate);
    }, [bills]);

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const { bill } = modalState;
        const paymentValue = parseFloat(paymentAmount) || 0;
        if (!bill || paymentValue <= 0) {
            alert("Invalid payment amount.");
            return;
        }

        const newTransaction: Transaction = {
            transactionId: `t-bill-${bill.billId}-${Date.now()}`,
            categoryId: bill.categoryId,
            amount: Math.round(paymentValue * 100),
            type: TransactionType.Expense,
            description: `Payment for ${bill.name}`,
            date: new Date().toISOString().split('T')[0],
            billId: bill.billId
        };
        setTransactions(prev => [newTransaction, ...prev]);
        showSuccess(`Payment of Ksh ${paymentValue.toLocaleString()} for '${bill.name}' recorded.`);
        setModalState({ type: null, bill: null });
    };

    const handleSaveBill = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, amount, dueDate, categoryId } = billForm;

        if (!name.trim() || !amount.trim() || !dueDate.trim() || !categoryId) {
            alert("Please complete all fields.");
            return;
        }

        const amountInCents = Math.round(parseFloat(amount) * 100);
        const dueDateInt = parseInt(dueDate, 10);
        
        if (isNaN(amountInCents) || amountInCents <= 0 || isNaN(dueDateInt) || dueDateInt < 1 || dueDateInt > 31) {
            alert("Please enter a valid amount and a due day between 1 and 31.");
            return;
        }

        if (modalState.type === 'edit' && modalState.bill) {
            const updatedBill: Bill = { ...modalState.bill, name, amount: amountInCents, dueDate: dueDateInt, categoryId };
            setBills(bills.map(b => b.billId === updatedBill.billId ? updatedBill : b));
            showSuccess(`'${name}' has been updated.`);
        } else {
            const newBill: Bill = { billId: `b${Date.now()}`, name, amount: amountInCents, dueDate: dueDateInt, categoryId };
            setBills(prev => [newBill, ...prev]);
            showSuccess(`'${name}' has been added.`);
        }
        setModalState({ type: null, bill: null });
    };
    
    const handleDeleteBill = () => {
        if (modalState.type === 'delete' && modalState.bill) {
            setBills(bills.filter(b => b.billId !== modalState.bill?.billId));
            showSuccess(`'${modalState.bill.name}' has been deleted.`);
            setModalState({ type: null, bill: null });
        }
    };
    
    const handleOpenAddModal = () => {
        const expenseCategories = financeCategories.filter(c => c.type === TransactionType.Expense);
        const defaultCategoryId = expenseCategories.length > 0 ? expenseCategories[0].categoryId : '';
        setBillForm({ name: '', amount: '', dueDate: '', categoryId: defaultCategoryId });
        setModalState({ type: 'add', bill: null });
    };

    const handleOpenEditModal = (bill: Bill) => {
        setBillForm({
            name: bill.name,
            amount: (bill.amount / 100).toFixed(2),
            dueDate: String(bill.dueDate),
            categoryId: bill.categoryId
        });
        setModalState({ type: 'edit', bill });
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Bill Management</h1>
                <div className="flex items-center gap-4">
                    {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
                    {canEdit && (
                        <button onClick={handleOpenAddModal} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                            Add New Bill
                        </button>
                    )}
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Bill</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Progress</th>
                                {canEdit && <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                            {sortedBills.map(bill => {
                                const { amountPaid, isPaid, progress } = getPaymentStatus(bill);
                                return (
                                <tr key={bill.billId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{bill.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Ksh {(amountPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {(bill.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{bill.dueDate}{getOrdinalSuffix(bill.dueDate)} of month</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                                            <div 
                                                className={`${isPaid ? 'bg-green-500' : 'bg-indigo-600'} h-2.5 rounded-full`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                {!isPaid && (
                                                    <button onClick={() => { setPaymentAmount(''); setModalState({ type: 'payment', bill }); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                        Add Payment
                                                    </button>
                                                )}
                                                <button onClick={() => setModalState({ type: 'history', bill })} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" title="View History"><ClockIcon /></button>
                                                <button onClick={() => handleOpenEditModal(bill)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" title="Edit Bill"><EditIcon /></button>
                                                <button onClick={() => setModalState({ type: 'delete', bill })} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Delete Bill"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={() => setModalState({ type: null, bill: null })} title={modalState.type === 'edit' ? 'Edit Bill' : 'Add New Bill'}>
                <form onSubmit={handleSaveBill} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="billName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bill Name</label>
                        <input type="text" id="billName" value={billForm.name} onChange={e => setBillForm({ ...billForm, name: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (Ksh)</label>
                            <input type="text" id="amount" value={billForm.amount} onChange={e => setBillForm({ ...billForm, amount: e.target.value })} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="0.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Day</label>
                            <input type="text" id="dueDate" value={billForm.dueDate} onChange={e => setBillForm({ ...billForm, dueDate: e.target.value })} inputMode="numeric" pattern="\d*" maxLength={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expense Category</label>
                        <select id="category" value={billForm.categoryId} onChange={e => setBillForm({ ...billForm, categoryId: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                            <option value="" disabled>Select a category</option>
                            {financeCategories.filter(c => c.type === TransactionType.Expense).map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setModalState({ type: null, bill: null })} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500">Save</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={modalState.type === 'payment'} onClose={() => setModalState({ type: null, bill: null })} title={`Add Payment for ${modalState.bill?.name}`}>
                <form onSubmit={handleAddPayment} className="mt-4 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remaining balance: <span className="font-semibold">Ksh {(modalState.bill ? getPaymentStatus(modalState.bill).remaining / 100 : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                    <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Amount (Ksh)</label>
                        <input type="text" id="paymentAmount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="0.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setModalState({ type: null, bill: null })} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500">Add Payment</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null, bill: null })} title="Confirm Deletion">
                <div className="mt-4">
                    <p className="text-slate-600 dark:text-slate-400">Are you sure you want to delete the recurring bill for <span className="font-semibold">"{modalState.bill?.name}"</span>? This action cannot be undone.</p>
                    <div className="pt-6 flex justify-end gap-2">
                        <button type="button" onClick={() => setModalState({ type: null, bill: null })} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                        <button onClick={handleDeleteBill} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-500">Delete</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={modalState.type === 'history'} onClose={() => setModalState({ type: null, bill: null })} title={`Payment History for "${modalState.bill?.name}"`} size="lg">
                <div className="mt-4 max-h-96 overflow-y-auto">
                    {(() => {
                        const paymentHistory = transactions
                            .filter(t => t.billId === modalState.bill?.billId)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (paymentHistory.length === 0) {
                            return <p className="text-center text-slate-500 py-8 dark:text-slate-400">No payments have been recorded for this bill.</p>;
                        }

                        return (
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Date</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {paymentHistory.map(transaction => (
                                        <tr key={transaction.transactionId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{new Date(transaction.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                                                Ksh {(transaction.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    })()}
                </div>
                 <div className="pt-6 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 mt-4">
                    <button type="button" onClick={() => setModalState({ type: null, bill: null })} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Bills;
