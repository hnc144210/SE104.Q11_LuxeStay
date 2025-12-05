import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx"; // Đảm bảo import đúng đuôi .jsx

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 👇 Bọc BrowserRouter ở ngoài cùng để App dùng được Routing */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
