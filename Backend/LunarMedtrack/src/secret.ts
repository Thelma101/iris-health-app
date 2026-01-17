import dotenv from 'dotenv';

dotenv.config({path: '.env'});

export const PORT = process.env.PORT || 900
export const JWT_SECRET = process.env.JWT_SECRET
export const BREVO_KEY = process.env.BREVO_KEY





