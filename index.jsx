import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../../NEXRAD_AI_Enterprise_1.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
