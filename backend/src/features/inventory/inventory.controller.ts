import type { Request, Response } from 'express';
import db from '../../config/db';
import { InventoryItem, InventoryCategory } from '../../types';

export const getInventoryItems = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM inventory_items ORDER BY name');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error });
    }
};

export const addInventoryItem = async (req: Request, res: Response) => {
    try {
        const { name, quantity, unit, expiryDate, lowStockThreshold, categoryId, price }: Omit<InventoryItem, 'itemId'> = req.body;
        const newItem = await db.query(
            'INSERT INTO inventory_items (name, quantity, unit, expiry_date, low_stock_threshold, category_id, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, quantity, unit, expiryDate, lowStockThreshold, categoryId, price]
        );
        res.status(201).json(newItem.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding inventory item', error });
    }
};

export const getInventoryCategories = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM inventory_categories ORDER BY name');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory categories', error });
    }
};

export const addInventoryCategory = async (req: Request, res: Response) => {
    try {
        const { name }: Omit<InventoryCategory, 'categoryId'> = req.body;
        const newCategory = await db.query(
            'INSERT INTO inventory_categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(newCategory.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding inventory category', error });
    }
};