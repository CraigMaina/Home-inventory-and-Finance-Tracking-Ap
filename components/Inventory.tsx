import React, { useState, useMemo } from 'react';
import Card from './Card';
import { mockInventory, mockInventoryCategories } from '../constants';
import type { InventoryItem, InventoryCategory } from '../types';

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
};

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>(mockInventory);
    const [categories, setCategories] = useState<InventoryCategory[]>(mockInventoryCategories);

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    
    const [newItem, setNewItem] = useState<Omit<InventoryItem, 'itemId'>>(defaultNewItem);
    const [newCategoryName, setNewCategoryName] = useState('');

    const groupedInventory = useMemo(() => {
        return categories.map(category => ({
            ...category,
            items: items.filter(item => item.categoryId === category.categoryId)
        }));
    }, [items, categories]);

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
        setItems(prev => [...prev, newItemWithId]);
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

    const Modal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode;
      }> = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-md" title={title}>
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">&times;</button>
              {children}
            </Card>
          </div>
        );
      };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Household Inventory</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                        Add New Category
                    </button>
                    <button onClick={() => { setNewItem({...defaultNewItem, categoryId: categories[0]?.categoryId || '' }); setIsAddItemModalOpen(true); }} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                        Add New Item
                    </button>
                </div>
            </div>

            {groupedInventory.map(category => (
                <Card key={category.categoryId} title={category.name}>
                    <div className="overflow-x-auto">
                        {category.items.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {category.items.map((item) => {
                                        const isLowStock = item.quantity <= item.lowStockThreshold;
                                        const expiryStatus = getExpiryStatus(item.expiryDate);

                                        const expiryBadge = {
                                            'expired': 'bg-red-100 text-red-800',
                                            'expiring-soon': 'bg-yellow-100 text-yellow-800',
                                            'good': 'bg-green-100 text-green-800',
                                            'none': 'bg-slate-100 text-slate-800'
                                        }[expiryStatus];
                                        
                                        const expiryText = {
                                            'expired': 'Expired',
                                            'expiring-soon': 'Expiring Soon',
                                            'good': 'Fresh',
                                            'none': 'N/A'
                                        }[expiryStatus];

                                        return (
                                            <tr key={item.itemId} className={isLowStock ? 'bg-orange-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700">{item.quantity} {item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expiryBadge}`}>
                                                        {expiryText}
                                                    </span>
                                                    {isLowStock && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-200 text-orange-800">Low Stock</span>}
                                                </div>
                                            </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No items in this category yet.</p>
                        )}
                    </div>
                </Card>
            ))}

            <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Add New Inventory Item">
                <form onSubmit={handleAddItem} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-slate-700">Item Name</label>
                        <input type="text" id="itemName" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                        <select id="category" value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                           <option value="" disabled>Select a category</option>
                            {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
                            <input type="number" id="quantity" min="0" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Unit</label>
                            <input type="text" id="unit" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700">Expiry Date (Optional)</label>
                        <input type="date" id="expiryDate" onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700">Low Stock Threshold</label>
                        <input type="number" id="lowStockThreshold" min="0" value={newItem.lowStockThreshold} onChange={e => setNewItem({...newItem, lowStockThreshold: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">
                            Add Item
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Category">
                <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
                     <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700">Category Name</label>
                        <input type="text" id="categoryName" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">
                            Add Category
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;