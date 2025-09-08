
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import api from './api';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', api);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Household API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});