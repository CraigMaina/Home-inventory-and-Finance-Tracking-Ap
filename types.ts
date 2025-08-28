export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export enum MealType {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Snack = 'snack',
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface Transaction {
  transactionId: string;
  category: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
}

export interface InventoryCategory {
  categoryId: string;
  name: string;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  lowStockThreshold: number;
  categoryId: string;
}

export interface Recipe {
  recipeId: string;
  name: string;
  instructions: string[];
  imageUrl: string;
  estimatedCost: number;
  ingredients: { name: string; quantity: string }[];
}

export interface MealPlan {
  date: string;
  meals: {
    [key in MealType]?: Recipe | null;
  };
}

export interface SavingsGoal {
  goalId: string;
  name:string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface ParsedReceiptItem {
    itemName: string;
    quantity: number;
    price: number;
}

export interface ParsedReceipt {
    vendorName: string;
    transactionDate: string;
    totalAmount: number;
    items: ParsedReceiptItem[];
}

export type View = 'dashboard' | 'finance' | 'inventory' | 'meal_planner' | 'recipes' | 'savings' | 'receipt_parser' | 'settings' | 'profile';