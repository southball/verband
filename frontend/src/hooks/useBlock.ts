import { BlockData } from "@/components/block";
import { useDataContext } from "@/contexts/data-context";
import { useAsync } from "react-use";

export const useBlock = (blockId?: number): BlockData | undefined => {
  const dataContext = useDataContext();
  return useAsync(
    () =>
      blockId ? dataContext.getBlock(blockId) : Promise.resolve(undefined),
    [blockId],
  ).value;
};
