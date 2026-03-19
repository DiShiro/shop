import express, { Request, Response } from 'express';
import * as productService from '../services/products';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'ID должен быть строкой' });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Не хватает полей' });
    }
    const newProduct = await productService.createProduct({ name, description, price, image });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'ID должен быть строкой' });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    const updated = await productService.updateProduct(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'ID должен быть строкой' });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID' });
    }
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;