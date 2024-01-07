import { Ref, useCallback } from "react";

// https://github.com/facebook/react/issues/13029#issuecomment-497641073
export const useCombinedRefs = <T extends any>(
  ...refs: Array<Ref<T>>
): Ref<T> =>
  useCallback(
    (element: T) =>
      refs.forEach((ref) => {
        if (!ref) {
          return;
        }

        if (typeof ref === "function") {
          return ref(element);
        }

        (ref as any).current = element;
      }),
    refs,
  );
