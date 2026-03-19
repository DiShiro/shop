import express, { Request, Response } from 'express';
import * as orderService from '../services/orders';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();


router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body; 
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }
    const order = await orderService.createOrder(req.user!.id, items);
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'ID должен быть строкой' });
    }
    if (!idParam) {
      return res.status(400).json({ error: 'ID не указан' });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;