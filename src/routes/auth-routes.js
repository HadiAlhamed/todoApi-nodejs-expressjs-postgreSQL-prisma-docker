import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { register, login } from '../controllers/auth-controller.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

export default router;
