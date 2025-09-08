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

export interface AuthContextType {
  user: User;
}

export interface FinanceCategory {
  categoryId: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  transactionId: string;
  categoryId: string;
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
  price?: number;
}

export interface Ingredient {
  itemId: string; // Corresponds to InventoryItem.itemId
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  recipeId: string;
  name: string;
  instructions: string[];
  imageUrl: string;
  estimatedCost: number;
  ingredients: Ingredient[];
  category: MealType;
}

export interface Meal {
  recipe: Recipe;
  prepared: boolean;
}

export interface MealPlan {
  date: string;
  meals: {
    [key in MealType]?: Meal | null;
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

export interface Announcement {
  announcementId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string; // ISO string
}
