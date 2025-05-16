// import { scan } from "react-scan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ClickSpark from "./components/ClickSpark/ClickSpark";
import "./index.css";
import { setupInterceptors } from "./config/axios.js";
import { useAuthStore } from "./store/useAuthStore.js";

setupInterceptors(
  () => useAuthStore.getState().token,
  useAuthStore.getState().setToken,
  useAuthStore.getState().setUser
);

// scan({
//   enabled: true,
// });

createRoot(document.getElementById("root")).render(
  // <StrictMode>
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
  // </StrictMode>
);

// serviceWorkerRegistration.register();
