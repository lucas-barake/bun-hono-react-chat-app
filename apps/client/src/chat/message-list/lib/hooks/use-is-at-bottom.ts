import React from "react";
import { type FollowOutput } from "react-virtuoso";
import * as O from "effect/Option";
import { pipe } from "effect";

type Args = {
  scrollParent: HTMLDivElement | undefined;
};
type Return = {
  isAtBottom: boolean;
  followOutput: FollowOutput;
};
export function useHandleIsAtBottom({ scrollParent }: Args): Return {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  const handleIsAtBottom = React.useCallback(() => {
    pipe(
      O.fromNullable(scrollParent),
      O.map((scrollParent) => {
        const { scrollTop, clientHeight, scrollHeight } = scrollParent;
        const threshold = 15;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - threshold);
      }),
    );
  }, [scrollParent]);

  React.useEffect(() => {
    return pipe(
      O.fromNullable(scrollParent),
      O.map((scrollParent) => {
        scrollParent.addEventListener("scroll", handleIsAtBottom);
        return () => {
          scrollParent.removeEventListener("scroll", handleIsAtBottom);
        };
      }),
      O.getOrElse(() => {
        return () => {};
      }),
    );
  }, [handleIsAtBottom, scrollParent]);

  const followOutput: FollowOutput = React.useCallback(() => {
    return isAtBottom ? "smooth" : false;
  }, [isAtBottom]);

  return {
    isAtBottom,
    followOutput,
  };
}
