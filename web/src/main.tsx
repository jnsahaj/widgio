import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Forward sendPrompt postMessages from widget iframes to the daemon.
window.addEventListener("message", (e) => {
  const data = (e as MessageEvent).data;
  if (data?.type === "sendPrompt" && typeof data.text === "string") {
    fetch("/input", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: data.text }),
    }).catch(() => {});
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
