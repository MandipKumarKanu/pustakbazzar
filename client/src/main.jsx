import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ClickSpark from "./components/ClickSpark/ClickSpark";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClickSpark
        sparkColor="#000"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={400}
      >
        <App />
      </ClickSpark>
    </BrowserRouter>
  </StrictMode>
);
