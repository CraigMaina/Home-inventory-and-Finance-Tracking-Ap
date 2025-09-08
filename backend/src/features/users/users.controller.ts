import { Request, Response } from 'express';
import { Role } from '../../types';

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // In a real app, you would get the user from a session or token.
        // Here we simulate it by returning the mock user.
        const mockUser = {
            userId: 'u1',
            name: 'Alex Doe',
            email: 'alex.doe@example.com',
            role: Role.Admin,
            avatarUrl: 'https://picsum.photos/seed/user1/100/100',
        };
        res.status(200).json(mockUser);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
};
