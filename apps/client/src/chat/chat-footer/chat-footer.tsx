import { Button } from "@/components/button";
import { Input } from "@/components/input";
import React from "react";

export const ChatFooter: React.FC = () => {
  return (
    <form className="flex items-center space-x-2 p-2 border-t">
      <Input className="flex-1" placeholder="Type a message" />

      <Button type="submit" size="sm" variant="outline">
        Send
      </Button>
    </form>
  );
};
