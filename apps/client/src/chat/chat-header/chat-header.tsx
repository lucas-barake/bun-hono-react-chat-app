import React from "react";
import { AsTabs } from "./as-tabs";

export const ChatHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <h1 className="text-lg font-semibold">Chat Room</h1>

      <AsTabs />
    </header>
  );
};
