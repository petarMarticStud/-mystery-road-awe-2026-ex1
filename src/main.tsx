import "../styles.css";
import "./react.css";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./app/App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Das Root-Element fehlt.");
}

const root = createRoot(container);

root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
