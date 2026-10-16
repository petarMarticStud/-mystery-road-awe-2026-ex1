import "../styles.css";
import { createRoot } from "react-dom/client";
import { KeyDemo } from "./features/throwawayComponent/DemoPerson";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Das Root-Element fehlt.");
}

const root = createRoot(container);

const nova = { id: "nova", name: "Nova" };
const alex = { id: "alex", name: "Alex" };

function renderDemo(reversed: boolean) {
  root.render(
    <>
      <button onClick={() => renderDemo(!reversed)}>
        Reihenfolge umkehren
      </button>

      <KeyDemo 
      people={reversed ? [alex, nova] : [nova, alex]} />
    </>,
  );
}

renderDemo(false);