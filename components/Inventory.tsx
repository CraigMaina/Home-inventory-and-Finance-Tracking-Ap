
import React, { useState, useMemo } from 'react';
import Card from './Card';
import { mockInventoryCategories } from '../constants';
import type { InventoryItem, InventoryCategory } from '../types';
import { Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

const getExpiryStatus = (expiryDate: string | null): 'expired' | 'expiring-soon' | 'good' | 'none' => {
  if (!expiryDate) return 'none';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring-soon';
  return 'good';
};

const defaultNewItem: Omit<InventoryItem, 'itemId'> = {
    name: '',
    quantity: 1,
    unit: 'pcs',
    expiryDate: null,
    lowStockThreshold: 1,
    categoryId: '',
    price: 0,
};

interface InventoryProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
    const { user } = useAuth();
    const canEdit = user.role === Role.Admin || user.role === Role.Editor;

    const [categories, setCategories] = useState<InventoryCategory[]>(mockInventoryCategories);

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
    
    const [newItem, setNewItem] = useState<Omit<InventoryItem, 'itemId'>>(defaultNewItem);
    const [newCategoryName, setNewCategoryName] = useState('');

    const groupedInventory = useMemo(() => {
        return categories.map(category => ({
            ...category,
            items: inventory.filter(item => item.categoryId === category.categoryId)
        }));
    }, [inventory, categories]);

    const shoppingList = useMemo(() => {
        return inventory
            .filter(item => item.quantity <= item.lowStockThreshold)
            .map(item => {
                const quantityToBuy = Math.max(1, (item.lowStockThreshold * 2) - item.quantity);
                return {
                    ...item,
                    quantityToBuy,
                    subtotal: (item.price || 0) * quantityToBuy
                };
            });
    }, [inventory]);

    const shoppingListTotal = useMemo(() => {
        return shoppingList.reduce((total, item) => total + item.subtotal, 0);
    }, [shoppingList]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.categoryId) {
            alert("Please fill in the item name and select a category.");
            return;
        }
        const newItemWithId: InventoryItem = {
            ...newItem,
            itemId: `i${Date.now()}`,
        };
        setInventory(prev => [...prev, newItemWithId]);
        setNewItem(defaultNewItem);
        setIsAddItemModalOpen(false);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            alert("Please enter a category name.");
            return;
        }
        const newCategory: InventoryCategory = {
            name: newCategoryName,
            categoryId: `c${Date.now()}`,
        };
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setIsAddCategoryModalOpen(false);
    };

    const handlePrintShoppingList = () => {
        const listContent = document.getElementById('shopping-list-content')?.innerHTML;
        if (!listContent) return;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the shopping list.');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Shopping List</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { font-family: sans-serif; padding: 2rem; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
                        th { background-color: #f8fafc; }
                        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
                        .total { font-weight: bold; font-size: 1.25rem; margin-top: 1.5rem; text-align: right; }
                    </style>
                </head>
                <body>
                    <h1>Shopping List</h1>
                    ${listContent}
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

    const Modal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode;
        size?: 'md' | 'lg' | 'xl';
      }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
        if (!isOpen) return null;
        const sizeClasses = {
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-2xl',
        }
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <Card className={`w-full ${sizeClasses[size]}`} title={title}>
              <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
              {children}
            </Card>
          </div>
        );
      };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Household Inventory</h1>
                {canEdit && (
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsShoppingListModalOpen(true)} className="bg-indigo-100 text-indigo-800 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70">
                            Generate Shopping List
                        </button>
                        <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                            Add New Category
                        </button>
                        <button onClick={() => { setNewItem({...defaultNewItem, categoryId: categories[0]?.categoryId || '' }); setIsAddItemModalOpen(true); }} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                            Add New Item
                        </button>
                    </div>
                )}
            </div>

            {groupedInventory.map(category => (
                <Card key={category.categoryId} title={category.name}>
                    <div className="overflow-x-auto">
                        {category.items.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Item Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Quantity</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Price</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Expiry Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {category.items.map((item) => {
                                        const isLowStock = item.quantity <= item.lowStockThreshold;
                                        const expiryStatus = getExpiryStatus(item.expiryDate);

                                        const expiryBadge = {
                                            'expired': 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                                            'expiring-soon': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                                            'good': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                                            'none': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                        }[expiryStatus];
                                        
                                        const expiryText = {
                                            'expired': 'Expired',
                                            'expiring-soon': 'Expiring Soon',
                                            'good': 'Fresh',
                                            'none': 'N/A'
                                        }[expiryStatus];

                                        return (
                                            <tr key={item.itemId} className={isLowStock ? 'bg-orange-50 dark:bg-orange-900/20' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700 dark:text-slate-300">{item.quantity} {item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {item.price ? `Ksh ${item.price.toLocaleString()}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expiryBadge}`}>
                                                        {expiryText}
                                                    </span>
                                                    {isLowStock && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">Low Stock</span>}
                                                </div>
                                            </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-slate-500 py-4 dark:text-slate-400">No items in this category yet.</p>
                        )}
                    </div>
                </Card>
            ))}
            <div className="print:hidden">
            <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Add New Inventory Item" size="lg">
                <form onSubmit={handleAddItem} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Item Name</label>
                        <input type="text" id="itemName" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select id="category" value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                           <option value="" disabled>Select a category</option>
                            {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                            <input type="number" id="quantity" min="0" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit</label>
                            <input type="text" id="unit" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Price (Ksh)</label>
                            <input type="number" id="price" min="0" step="0.01" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                        <div>
                            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Threshold</label>
                            <input type="number" id="lowStockThreshold" min="0" value={newItem.lowStockThreshold} onChange={e => setNewItem({...newItem, lowStockThreshold: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date (Optional)</label>
                        <input type="date" id="expiryDate" onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                            Add Item
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Category">
                <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
                     <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name</label>
                        <input type="text" id="categoryName" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                            Add Category
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isShoppingListModalOpen} onClose={() => setIsShoppingListModalOpen(false)} title="Generated Shopping List" size="xl">
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {shoppingList.length > 0 ? (
                        <div id="shopping-list-content">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Item</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Qty to Buy</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Est. Price</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {shoppingList.map(item => (
                                        <tr key={item.itemId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-200">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.quantityToBuy} {item.unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.price ? `Ksh ${item.price.toLocaleString()}` : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-700 dark:text-slate-300">{item.price ? `Ksh ${item.subtotal.toLocaleString()}` : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             <div className="mt-4 text-right font-bold text-lg text-slate-800 dark:text-slate-200 total">
                                Estimated Total: Ksh {shoppingListTotal.toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8 dark:text-slate-400">Your inventory is well-stocked! No items are currently on the shopping list.</p>
                    )}
                </div>
                 <div className="pt-6 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 mt-4">
                    <button type="button" onClick={() => setIsShoppingListModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Close
                    </button>
                    <button type="button" onClick={handlePrintShoppingList} disabled={shoppingList.length === 0} className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-500">
                        Print List
                    </button>
                </div>
            </Modal>
            </div>
        </div>
    );
};

export default Inventory;