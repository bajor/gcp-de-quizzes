import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../src/App";
import "../src/styles.css";
import { fixtureQuestionSet } from "../src/test/fixtures";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App questionSet={fixtureQuestionSet} />
  </StrictMode>,
);
