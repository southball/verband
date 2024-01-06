import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import vs from "react-syntax-highlighter/dist/cjs/styles/prism/vs";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { PenIcon, ScrollTextIcon } from "lucide-react";

type BlockProps = {
  blockId: number;
};

export const Block: React.FC<BlockProps> = ({ blockId }) => {
  const theme = useTheme();

  return (
    <div className="rounded-md border px-4 py-2 relative group">
      <div className="absolute right-2 top-2 opacity-0 space-x-1 group-hover:opacity-100 transition-all">
        <Button variant="outline" size="icon-sm">
          <PenIcon className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="icon-sm">
          <ScrollTextIcon className="h-3 w-3" />
        </Button>
      </div>
      <div>
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
    </div>
  );
};
