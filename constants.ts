import type { User, Transaction, InventoryItem, Recipe, MealPlan, SavingsGoal, InventoryCategory, FinanceCategory } from './types';
import { Role, TransactionType, MealType } from './types';

export const mockUser: User = {
  userId: 'u1',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  role: Role.Admin,
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};

export const mockFinanceCategories: FinanceCategory[] = [
    { categoryId: 'fc1', name: 'Groceries', type: TransactionType.Expense },
    { categoryId: 'fc2', name: 'Salary', type: TransactionType.Income },
    { categoryId: 'fc3', name: 'Utilities', type: TransactionType.Expense },
    { categoryId: 'fc4', name: 'Transport', type: TransactionType.Expense },
    { categoryId: 'fc5', name: 'Dining Out', type: TransactionType.Expense },
    { categoryId: 'fc6', name: 'Freelance', type: TransactionType.Income },
];

export const mockTransactions: Transaction[] = [
  { transactionId: 't1', categoryId: 'fc1', amount: 75.50, type: TransactionType.Expense, description: 'Weekly shopping at FreshMart', date: '2024-07-28' },
  { transactionId: 't2', categoryId: 'fc2', amount: 2500.00, type: TransactionType.Income, description: 'Monthly salary', date: '2024-07-25' },
  { transactionId: 't3', categoryId: 'fc3', amount: 120.00, type: TransactionType.Expense, description: 'Electricity and Water Bill', date: '2024-07-22' },
  { transactionId: 't4', categoryId: 'fc4', amount: 45.00, type: TransactionType.Expense, description: 'Monthly bus pass', date: '2024-07-20' },
  { transactionId: 't5', categoryId: 'fc5', amount: 55.20, type: TransactionType.Expense, description: 'Dinner with friends', date: '2024-07-18' },
  { transactionId: 't6', categoryId: 'fc6', amount: 300.00, type: TransactionType.Income, description: 'Web design project', date: '2024-07-15' },
];

export const mockInventoryCategories: InventoryCategory[] = [
    { categoryId: 'c1', name: 'Kitchen' },
    { categoryId: 'c2', name: 'Toiletries' },
    { categoryId: 'c3', name: 'Cleaning Supplies' },
];

export const mockInventory: InventoryItem[] = [
  { itemId: 'i1', name: 'Apples', quantity: 5, unit: 'pcs', expiryDate: '2024-08-10', lowStockThreshold: 2, categoryId: 'c1' },
  { itemId: 'i2', name: 'Milk', quantity: 1, unit: 'L', expiryDate: '2024-08-05', lowStockThreshold: 1, categoryId: 'c1' },
  { itemId: 'i3', name: 'Bread', quantity: 1, unit: 'loaf', expiryDate: '2024-08-02', lowStockThreshold: 1, categoryId: 'c1' },
  { itemId: 'i4', name: 'Chicken Breast', quantity: 2, unit: 'kg', expiryDate: '2024-08-04', lowStockThreshold: 1, categoryId: 'c1' },
  { itemId: 'i5', name: 'Rice', quantity: 10, unit: 'kg', expiryDate: null, lowStockThreshold: 2, categoryId: 'c1' },
  { itemId: 'i6', name: 'Toothpaste', quantity: 2, unit: 'tubes', expiryDate: null, lowStockThreshold: 1, categoryId: 'c2' },
  { itemId: 'i7', name: 'Shampoo', quantity: 1, unit: 'bottle', expiryDate: null, lowStockThreshold: 1, categoryId: 'c2' },
  { itemId: 'i8', name: 'Dish Soap', quantity: 1, unit: 'bottle', expiryDate: null, lowStockThreshold: 1, categoryId: 'c3' },
];

export const mockRecipes: Recipe[] = [
  { recipeId: 'r1', name: 'Spaghetti Carbonara', imageUrl: 'https://picsum.photos/seed/carbonara/400/300', estimatedCost: 15, instructions: ['Boil pasta.', 'Fry pancetta.', 'Mix eggs and cheese.', 'Combine everything.'], ingredients: [{name: 'Spaghetti', quantity: '200g'}, {name: 'Pancetta', quantity: '100g'}]},
  { recipeId: 'r2', name: 'Chicken Curry', imageUrl: 'https://picsum.photos/seed/curry/400/300', estimatedCost: 20, instructions: ['Sauté onions and garlic.', 'Add chicken and cook.', 'Add spices and coconut milk.', 'Simmer until cooked.'], ingredients: [{name: 'Chicken Breast', quantity: '500g'}, {name: 'Coconut Milk', quantity: '400ml'}]},
  { recipeId: 'r3', name: 'Avocado Toast', imageUrl: 'https://picsum.photos/seed/toast/400/300', estimatedCost: 5, instructions: ['Toast bread.', 'Mash avocado.', 'Spread on toast.', 'Season with salt and pepper.'], ingredients: [{name: 'Bread', quantity: '2 slices'}, {name: 'Avocado', quantity: '1'}]},
];

export const mockMealPlan: MealPlan[] = [
    { date: '2024-07-29', meals: { [MealType.Breakfast]: mockRecipes[2], [MealType.Lunch]: mockRecipes[1], [MealType.Dinner]: mockRecipes[0] } },
    { date: '2024-07-30', meals: { [MealType.Breakfast]: mockRecipes[2], [MealType.Lunch]: null, [MealType.Dinner]: mockRecipes[1] } },
    { date: '2024-07-31', meals: { [MealType.Breakfast]: null, [MealType.Lunch]: mockRecipes[0], [MealType.Dinner]: null } },
];

export const mockSavingsGoals: SavingsGoal[] = [
    { goalId: 'g1', name: 'Vacation to Bali', targetAmount: 3000, currentAmount: 1750, deadline: '2024-12-31' },
    { goalId: 'g2', name: 'New Laptop', targetAmount: 1500, currentAmount: 400, deadline: '2024-10-30' },
];