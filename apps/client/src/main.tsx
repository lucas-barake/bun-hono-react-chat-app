import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Chat } from "./chat/chat";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>
);
