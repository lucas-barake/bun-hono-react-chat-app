import { Button } from "@/components/button";
import { useSenderSession } from "@/lib/use-sender-session";
import { ChatMessage } from "@org/api-contract";
import React from "react";

export const AsTabs: React.FC = () => {
  const as = useSenderSession((store) => store.as);

  function toggleAs(as: ChatMessage["as"]) {
    useSenderSession.setState({ as });
  }

  return (
    <div className="flex gap-2">
      <Button variant={as === "john" ? "default" : "outline"} onClick={() => toggleAs("john")} size="sm">
        John
      </Button>

      <Button variant={as === "melissa" ? "default" : "outline"} onClick={() => toggleAs("melissa")} size="sm">
        Melissa
      </Button>
    </div>
  );
};
