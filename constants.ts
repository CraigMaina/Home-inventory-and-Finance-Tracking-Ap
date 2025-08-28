
import type { User, Transaction, InventoryItem, Recipe, MealPlan, SavingsGoal, InventoryCategory, FinanceCategory, Meal, Announcement } from './types';
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
  { transactionId: 't1', categoryId: 'fc1', amount: 9815, type: TransactionType.Expense, description: 'Weekly shopping at FreshMart', date: '2024-07-28' },
  { transactionId: 't2', categoryId: 'fc2', amount: 325000, type: TransactionType.Income, description: 'Monthly salary', date: '2024-07-25' },
  { transactionId: 't3', categoryId: 'fc3', amount: 15600, type: TransactionType.Expense, description: 'Electricity and Water Bill', date: '2024-07-22' },
  { transactionId: 't4', categoryId: 'fc4', amount: 5850, type: TransactionType.Expense, description: 'Monthly bus pass', date: '2024-07-20' },
  { transactionId: 't5', categoryId: 'fc5', amount: 7176, type: TransactionType.Expense, description: 'Dinner with friends', date: '2024-07-18' },
  { transactionId: 't6', categoryId: 'fc6', amount: 39000, type: TransactionType.Income, description: 'Web design project', date: '2024-07-15' },
];

export const mockInventoryCategories: InventoryCategory[] = [
    { categoryId: 'c1', name: 'Kitchen' },
    { categoryId: 'c2', name: 'Toiletries' },
    { categoryId: 'c3', name: 'Cleaning Supplies' },
];

export const mockInventory: InventoryItem[] = [
  { itemId: 'i1', name: 'Apples', quantity: 1, unit: 'pcs', expiryDate: '2024-08-10', lowStockThreshold: 2, categoryId: 'c1', price: 65 },
  { itemId: 'i2', name: 'Milk', quantity: 1, unit: 'L', expiryDate: '2024-08-05', lowStockThreshold: 1, categoryId: 'c1', price: 195 },
  { itemId: 'i3', name: 'Bread', quantity: 12, unit: 'slices', expiryDate: '2024-08-02', lowStockThreshold: 4, categoryId: 'c1', price: 260 },
  { itemId: 'i4', name: 'Chicken Breast', quantity: 0, unit: 'kg', expiryDate: '2024-08-04', lowStockThreshold: 1, categoryId: 'c1', price: 1040 },
  { itemId: 'i5', name: 'Rice', quantity: 10, unit: 'kg', expiryDate: null, lowStockThreshold: 2, categoryId: 'c1', price: 1300 },
  { itemId: 'i6', name: 'Toothpaste', quantity: 1, unit: 'tubes', expiryDate: null, lowStockThreshold: 1, categoryId: 'c2', price: 390 },
  { itemId: 'i7', name: 'Shampoo', quantity: 1, unit: 'bottle', expiryDate: null, lowStockThreshold: 1, categoryId: 'c2', price: 650 },
  { itemId: 'i8', name: 'Dish Soap', quantity: 1, unit: 'bottle', expiryDate: null, lowStockThreshold: 1, categoryId: 'c3', price: 325 },
  { itemId: 'i9', name: 'Spaghetti', quantity: 500, unit: 'g', expiryDate: null, lowStockThreshold: 200, categoryId: 'c1', price: 234 },
  { itemId: 'i10', name: 'Pancetta', quantity: 200, unit: 'g', expiryDate: '2024-08-20', lowStockThreshold: 50, categoryId: 'c1', price: 585 },
  { itemId: 'i11', name: 'Eggs', quantity: 6, unit: 'pcs', expiryDate: '2024-08-15', lowStockThreshold: 4, categoryId: 'c1', price: 455 },
  { itemId: 'i12', name: 'Parmesan Cheese', quantity: 100, unit: 'g', expiryDate: '2024-09-01', lowStockThreshold: 20, categoryId: 'c1', price: 780 },
  { itemId: 'i13', name: 'Coconut Milk', quantity: 800, unit: 'ml', expiryDate: null, lowStockThreshold: 400, categoryId: 'c1', price: 572 },
  { itemId: 'i14', name: 'Onion', quantity: 2, unit: 'pcs', expiryDate: '2024-08-25', lowStockThreshold: 2, categoryId: 'c1', price: 39 },
  { itemId: 'i15', name: 'Garlic', quantity: 3, unit: 'cloves', expiryDate: '2024-08-25', lowStockThreshold: 2, categoryId: 'c1', price: 65 },
  { itemId: 'i16', name: 'Avocado', quantity: 1, unit: 'pcs', expiryDate: '2024-08-05', lowStockThreshold: 1, categoryId: 'c1', price: 156 },
  { itemId: 'i17', name: 'Peanut Butter', quantity: 500, unit: 'g', expiryDate: null, lowStockThreshold: 100, categoryId: 'c1', price: 520 },
];

export const mockRecipes: Recipe[] = [
  { recipeId: 'r1', name: 'Spaghetti Carbonara', imageUrl: 'https://picsum.photos/seed/carbonara/400/300', estimatedCost: 1950, instructions: ['Boil pasta.', 'Fry pancetta.', 'Mix eggs and cheese.', 'Combine everything.'], 
    category: MealType.Dinner,
    ingredients: [
        { itemId: 'i9', name: 'Spaghetti', quantity: 200, unit: 'g' }, 
        { itemId: 'i10', name: 'Pancetta', quantity: 100, unit: 'g' },
        { itemId: 'i11', name: 'Eggs', quantity: 2, unit: 'pcs' },
        { itemId: 'i12', name: 'Parmesan Cheese', quantity: 50, unit: 'g' },
    ]},
  { recipeId: 'r2', name: 'Chicken Curry', imageUrl: 'https://picsum.photos/seed/curry/400/300', estimatedCost: 2600, instructions: ['Sauté onions and garlic.', 'Add chicken and cook.', 'Add spices and coconut milk.', 'Simmer until cooked.'], 
    category: MealType.Lunch,
    ingredients: [
        { itemId: 'i4', name: 'Chicken Breast', quantity: 0.5, unit: 'kg' },
        { itemId: 'i13', name: 'Coconut Milk', quantity: 400, unit: 'ml' },
        { itemId: 'i14', name: 'Onion', quantity: 1, unit: 'pcs' },
        { itemId: 'i15', name: 'Garlic', quantity: 2, unit: 'cloves' },
    ]},
  { recipeId: 'r3', name: 'Avocado Toast', imageUrl: 'https://picsum.photos/seed/toast/400/300', estimatedCost: 650, instructions: ['Toast bread.', 'Mash avocado.', 'Spread on toast.', 'Season with salt and pepper.'], 
    category: MealType.Breakfast,
    ingredients: [
        { itemId: 'i3', name: 'Bread', quantity: 2, unit: 'slices' },
        { itemId: 'i16', name: 'Avocado', quantity: 1, unit: 'pcs' },
    ]},
  { recipeId: 'r4', name: 'Apple & Peanut Butter', imageUrl: 'https://picsum.photos/seed/snack/400/300', estimatedCost: 260, instructions: ['Slice apple.', 'Serve with peanut butter.'], 
    category: MealType.Snack,
    ingredients: [
        { itemId: 'i1', name: 'Apples', quantity: 1, unit: 'pcs' },
        { itemId: 'i17', name: 'Peanut Butter', quantity: 30, unit: 'g' },
    ]},
];

const createMeal = (recipe: Recipe): Meal => ({
    recipe,
    prepared: false,
});

export const mockMealPlan: MealPlan[] = [
    { date: '2024-07-29', meals: { [MealType.Breakfast]: createMeal(mockRecipes[2]), [MealType.Lunch]: createMeal(mockRecipes[1]), [MealType.Dinner]: createMeal(mockRecipes[0]) } },
    { date: '2024-07-30', meals: { [MealType.Breakfast]: createMeal(mockRecipes[2]), [MealType.Lunch]: null, [MealType.Dinner]: createMeal(mockRecipes[1]) } },
    { date: '2024-07-31', meals: { [MealType.Breakfast]: null, [MealType.Lunch]: createMeal(mockRecipes[0]), [MealType.Dinner]: null } },
];

export const mockSavingsGoals: SavingsGoal[] = [
    { goalId: 'g1', name: 'Vacation to Bali', targetAmount: 390000, currentAmount: 227500, deadline: '2024-12-31' },
    { goalId: 'g2', name: 'New Laptop', targetAmount: 195000, currentAmount: 52000, deadline: '2024-10-30' },
];

export const mockAnnouncements: Announcement[] = [
  {
    announcementId: 'a1',
    authorId: 'u1',
    authorName: 'Alex Doe',
    authorAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    content: "Just a reminder that we're having a family game night this Friday at 7 PM. Pizza will be provided! 🍕 Let me know if you have any game requests.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    announcementId: 'a2',
    authorId: 'u1',
    authorName: 'Alex Doe',
    authorAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    content: "I've updated the shopping list. Please check the inventory page and add anything I might have missed before I go to the store tomorrow morning.",
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
  },
  {
    announcementId: 'a3',
    authorId: 'u1',
    authorName: 'Alex Doe',
    authorAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    content: "Look at this great recipe I found for this weekend!",
    mediaUrl: 'https://picsum.photos/seed/recipe-pic/600/400',
    mediaType: 'image',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];