const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

// --- Mock Data (copied from frontend constants) ---
const Role = { Admin: 'admin', Editor: 'editor', Viewer: 'viewer' };
const TransactionType = { Income: 'income', Expense: 'expense' };

const mockUser = {
  userId: 'u1', name: 'Alex Doe', email: 'alex.doe@example.com', role: Role.Admin, avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};

const mockFinanceCategories = [
    { categoryId: 'fc1', name: 'Groceries', type: TransactionType.Expense },
    { categoryId: 'fc2', name: 'Salary', type: TransactionType.Income },
    { categoryId: 'fc3', name: 'Utilities', type: TransactionType.Expense },
    { categoryId: 'fc4', name: 'Transport', type: TransactionType.Expense },
    { categoryId: 'fc5', name: 'Dining Out', type: TransactionType.Expense },
    { categoryId: 'fc6', name: 'Freelance', type: TransactionType.Income },
];

const mockTransactions = [
  { transactionId: 't1', categoryId: 'fc1', amount: 98.15, type: TransactionType.Expense, description: 'Weekly shopping at FreshMart', date: '2024-07-28' },
  { transactionId: 't2', categoryId: 'fc2', amount: 3250.00, type: TransactionType.Income, description: 'Monthly salary', date: '2024-07-25' },
  { transactionId: 't3', categoryId: 'fc3', amount: 156.00, type: TransactionType.Expense, description: 'Electricity and Water Bill', date: '2024-07-22' },
];

const mockInventoryCategories = [
    { categoryId: 'c1', name: 'Kitchen' }, { categoryId: 'c2', name: 'Toiletries' }, { categoryId: 'c3', name: 'Cleaning Supplies' },
];

const mockInventory = [
  { itemId: 'i1', name: 'Apples', quantity: 1, unit: 'pcs', expiryDate: '2024-08-10', lowStockThreshold: 2, categoryId: 'c1', price: 0.65 },
  { itemId: 'i2', name: 'Milk', quantity: 1, unit: 'L', expiryDate: '2024-08-05', lowStockThreshold: 1, categoryId: 'c1', price: 1.95 },
  { itemId: 'i3', name: 'Bread', quantity: 12, unit: 'slices', expiryDate: '2024-08-02', lowStockThreshold: 4, categoryId: 'c1', price: 2.60 },
];

const mockSavingsGoals = [
    { goalId: 'g1', name: 'Vacation to Bali', targetAmount: 3900.00, currentAmount: 2275.00, deadline: '2024-12-31' },
    { goalId: 'g2', name: 'New Laptop', targetAmount: 1950.00, currentAmount: 520.00, deadline: '2024-10-30' },
];

const mockAnnouncements = [
  { announcementId: 'a1', authorId: 'u1', content: "Just a reminder that we're having a family game night this Friday at 7 PM.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { announcementId: 'a2', authorId: 'u1', content: "I've updated the shopping list. Please check the inventory page.", timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
];

// --- Seeding Logic ---

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('Starting database seeding...');

        // Clear existing data
        console.log('Clearing existing tables...');
        await client.query('TRUNCATE users, finance_categories, transactions, inventory_categories, inventory_items, savings_goals, announcements RESTART IDENTITY CASCADE');

        // Seed users
        console.log('Seeding users...');
        await client.query('INSERT INTO users (user_id, name, email, role, avatar_url) VALUES ($1, $2, $3, $4, $5)', [mockUser.userId, mockUser.name, mockUser.email, mockUser.role, mockUser.avatarUrl]);
        
        // Seed finance categories
        console.log('Seeding finance categories...');
        for (const cat of mockFinanceCategories) {
            await client.query('INSERT INTO finance_categories (category_id, name, type) VALUES ($1, $2, $3)', [cat.categoryId, cat.name, cat.type]);
        }

        // Seed transactions
        console.log('Seeding transactions...');
        for (const tx of mockTransactions) {
            await client.query('INSERT INTO transactions (transaction_id, category_id, amount, type, description, date) VALUES ($1, $2, $3, $4, $5, $6)', [tx.transactionId, tx.categoryId, tx.amount, tx.type, tx.description, tx.date]);
        }

        // Seed inventory categories
        console.log('Seeding inventory categories...');
        for (const cat of mockInventoryCategories) {
            await client.query('INSERT INTO inventory_categories (category_id, name) VALUES ($1, $2)', [cat.categoryId, cat.name]);
        }

        // Seed inventory items
        console.log('Seeding inventory items...');
        for (const item of mockInventory) {
            await client.query('INSERT INTO inventory_items (item_id, name, quantity, unit, expiry_date, low_stock_threshold, category_id, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [item.itemId, item.name, item.quantity, item.unit, item.expiryDate, item.lowStockThreshold, item.categoryId, item.price]);
        }
        
        // Seed savings goals
        console.log('Seeding savings goals...');
        for (const goal of mockSavingsGoals) {
            await client.query('INSERT INTO savings_goals (goal_id, name, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5)', [goal.goalId, goal.name, goal.targetAmount, goal.currentAmount, goal.deadline]);
        }
        
        // Seed announcements
        console.log('Seeding announcements...');
        for (const an of mockAnnouncements) {
            await client.query('INSERT INTO announcements (announcement_id, author_id, content, timestamp) VALUES ($1, $2, $3, $4)', [an.announcementId, an.authorId, an.content, an.timestamp]);
        }

        await client.query('COMMIT');
        console.log('Database seeding completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during seeding, transaction rolled back:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(err => {
    console.error('Failed to run seed script:', err);
    process.exit(1);
});
