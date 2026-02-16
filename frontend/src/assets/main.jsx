import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import Login from "./Login.jsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Products />} />
    </Routes>
    </BrowserRouter>
)