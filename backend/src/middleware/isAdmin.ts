import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../db';

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Не авторизован' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  next();
};