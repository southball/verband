import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import vs from "react-syntax-highlighter/dist/cjs/styles/prism/vs";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { PenIcon, ScrollTextIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { BlockEditor } from "./block-editor";
import Link from "next/link";

type BlockProps = {
  blockId: number;
  postId: number;
  postTitle?: string;
  showActions?: boolean;
};

export const Block: React.FC<BlockProps> = ({
  blockId,
  postId,
  postTitle,
  showActions,
}) => {
  const theme = useTheme();
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div className="rounded-md border relative group">
      {mode === "view" && (
        <>
          {showActions && (
            <div className="flex absolute right-2 top-2 opacity-0 space-x-1 group-hover:opacity-100 transition-all">
              <div>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setMode("edit")}
                      >
                        <PenIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon-sm">
                        <ScrollTextIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>History</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
          <div className="px-4 pt-2 text-xs text-muted-foreground">
            <Link href={`/?postId=${postId}&blockId=${blockId}`}>
              #{blockId}
            </Link>
          </div>
          {postTitle && (
            <div className="px-4 pt-2 space-y-0.5">
              <div className="text-xs font-bold">{postTitle}</div>
              <div className="leading-[0]">
                <Badge variant="inherit" className="px-2 py-0">
                  <span className="text-[0.5rem]">SECCON CTF</span>
                </Badge>
              </div>
            </div>
          )}
          <div className="px-4 pb-2 pt-1">
            {blockId % 3 === 0 ? (
              <SyntaxHighlighter
                language="js"
                style={theme.resolvedTheme === "dark" ? vscDarkPlus : vs}
              >
                {"var hello = 0; \nfunction testing() { return 5; }"}
              </SyntaxHighlighter>
            ) : (
              <div>Block {blockId}</div>
            )}
          </div>
        </>
      )}
      {mode === "edit" && (
        <div className="px-4 py-2 space-y-2">
          <div className="font-medium">Editing block {blockId}</div>
          <BlockEditor
            cancellable
            onCancel={() => setMode("view")}
            onSubmit={() => setMode("view")}
          />
        </div>
      )}
    </div>
  );
};
