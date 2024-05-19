import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Chat } from "./chat/chat";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Chat />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
