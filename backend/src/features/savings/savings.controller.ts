import type { Request, Response } from 'express';
import db from '../../config/db';
import { SavingsGoal } from '../../types';

export const getSavingsGoals = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM savings_goals ORDER BY deadline');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching savings goals', error });
    }
};

export const addSavingsGoal = async (req: Request, res: Response) => {
    try {
        const { name, targetAmount, deadline }: Omit<SavingsGoal, 'goalId' | 'currentAmount'> = req.body;
        const newGoal = await db.query(
            'INSERT INTO savings_goals (name, target_amount, current_amount, deadline) VALUES ($1, $2, 0, $3) RETURNING *',
            [name, targetAmount, deadline]
        );
        res.status(201).json(newGoal.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding savings goal', error });
    }
};

export const addFundsToGoal = async (req: Request, res: Response) => {
    try {
        const { goalId } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount provided.' });
        }

        const updatedGoal = await db.query(
            'UPDATE savings_goals SET current_amount = current_amount + $1 WHERE goal_id = $2 RETURNING *',
            [amount, goalId]
        );

        if (updatedGoal.rows.length === 0) {
            return res.status(404).json({ message: 'Savings goal not found.' });
        }

        res.status(200).json(updatedGoal.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding funds to goal', error });
    }
};