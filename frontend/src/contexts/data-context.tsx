import { BlockData } from "@/components/block";
import { Dataloader } from "@/lib/dataloader";
import { dummyBlocks } from "@/lib/dummy-blocks";
import { nextTick } from "process";
import React, { useContext, useRef } from "react";

type DataContextType = {
  getBlock: (blockId: number) => Promise<BlockData>;
};

const DataContext = React.createContext<DataContextType>({
  getBlock: () => Promise.reject(new Error("Not implemented!")),
});

export const useDataContext = () => useContext(DataContext);

export const DataContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const blockDataloader = new Dataloader<number, BlockData>(async (keys) => {
    return new Promise<Record<number, BlockData>>((resolve, reject) => {
      const result = {} as Record<number, BlockData>;
      for (const key of keys) {
        result[key] = dummyBlocks[key % 3];
      }
      setTimeout(() => resolve(result), 500);
    });
  });

  const getBlock = blockDataloader.get.bind(blockDataloader);

  return (
    <DataContext.Provider value={{ getBlock }}>{children}</DataContext.Provider>
  );
};
