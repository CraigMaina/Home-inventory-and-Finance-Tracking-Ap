import type { Request, Response } from 'express';
import db from '../../config/db';
import { Transaction, FinanceCategory } from '../../types';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM transactions ORDER BY date DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

export const addTransaction = async (req: Request, res: Response) => {
    try {
        const { categoryId, amount, type, description, date }: Omit<Transaction, 'transactionId'> = req.body;
        const newTransaction = await db.query(
            'INSERT INTO transactions (category_id, amount, type, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [categoryId, amount, type, description, date]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding transaction', error });
    }
};

export const getFinanceCategories = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM finance_categories ORDER BY name');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching finance categories', error });
    }
};

export const addFinanceCategory = async (req: Request, res: Response) => {
    try {
        const { name, type }: Omit<FinanceCategory, 'categoryId'> = req.body;
        const newCategory = await db.query(
            'INSERT INTO finance_categories (name, type) VALUES ($1, $2) RETURNING *',
            [name, type]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding finance category', error });
    }
};