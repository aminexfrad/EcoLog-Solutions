import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlatformProvider } from "./context/PlatformContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </AuthProvider>
  </BrowserRouter>
);
