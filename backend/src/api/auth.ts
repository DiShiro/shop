import express, { Request, Response } from "express";
import { createUser } from "../serviсes/users";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  res.status(501).json({ error: "Не реализовано" });
});

router.post("/logout", async (req: Request, res: Response) => {
  res.status(501).json({ error: "Не реализовано" });
});

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля: имя пользователя, электронная почта, пароль." });
    }

    const newUser = await createUser(username, email, password);

    return res.status(201).json({ user: newUser });
  } catch (error: any) {

    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return res.status(409).json({ error: "Пользователь с таким адресом электронной почты уже существует." });
      }
      if (target?.includes('username')) {
        return res.status(409).json({ error: "Пользователь с таким именем пользователя уже существует." });
      }
    }

    console.error("Registration error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default router;