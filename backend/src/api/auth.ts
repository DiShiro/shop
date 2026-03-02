import express, { Request, Response } from "express";
import { hashPass } from "../utils/hashPass";
import prisma from "../db";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
});

router.post("/logout", async (req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
});

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: username, email, password" });
    }

    const hashedPass = await hashPass(password);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPass,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return res.status(201).json({ user: newUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      if (target?.includes('username')) {
        return res.status(409).json({ error: "User with this username already exists" });
      }
    }

    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;