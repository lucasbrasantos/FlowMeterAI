import dotenv from 'dotenv';

dotenv.config();

export const NODE_PORT = process.env.NODE_PORT || 3000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;


export const DB_NAME = process.env.DB_NAME as string;
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PORT = process.env.DB_PORT as unknown as number;

export const DATABASE_URL = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;