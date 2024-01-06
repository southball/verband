import { Topbar } from "@/components/topbar";
import React from "react";

export const DefaultLayout: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => (
  <div className="bg-background text-foreground flex flex-col h-[100dvh]">
    <Topbar />
    <div className="grow basis-0 overflow-auto">{children}</div>
  </div>
);
