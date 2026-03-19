import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./api/auth";
import productsRouter from "./api/products";  
import ordersRouter from "./api/orders";   

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);  
app.use("/api/orders", ordersRouter);       

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok!!!!!!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
