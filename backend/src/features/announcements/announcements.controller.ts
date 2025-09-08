
import { Request, Response } from 'express';
import db from '../../config/db';
import { Announcement } from '../../types';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM announcements ORDER BY timestamp DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching announcements', error });
    }
};

export const addAnnouncement = async (req: Request, res: Response) => {
    try {
        const { authorId, content, mediaUrl, mediaType }: Omit<Announcement, 'announcementId' | 'timestamp' | 'authorName' | 'authorAvatarUrl'> = req.body;
        const newAnnouncement = await db.query(
            'INSERT INTO announcements (author_id, content, media_url, media_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [authorId, content, mediaUrl, mediaType]
        );
        // In a real app, you'd join with the users table to get author details
        res.status(201).json(newAnnouncement.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding announcement', error });
    }
};