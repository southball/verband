import React, { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import vs from "react-syntax-highlighter/dist/cjs/styles/prism/vs";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { PaperclipIcon, PenIcon, ScrollTextIcon } from "lucide-react";
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
import { useAsync } from "react-use";
import { md2html } from "@/lib/markdown";
import { useRouter } from "next/router";
import { useBlock } from "@/hooks/useBlock";
import { BarLoader, BeatLoader, SyncLoader } from "react-spinners";

type BlockProps = {
  blockId: number;
  postId: number;
  postTitle?: string;
  showActions?: boolean;
};

export type BlockData =
  | {
      contentType: "markdown";
      content: string;
    }
  | {
      contentType: "code";
      content: string;
      metadata: { language: string };
    }
  | {
      contentType: "file";
      files: { url: string; filename: string }[];
    };

export const Block: React.FC<BlockProps> = ({
  blockId,
  postId,
  postTitle,
  showActions,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const block = useBlock(blockId);
  const selfRef = useRef<HTMLDivElement | null>(null);
  const { value: mdHtml } = useAsync(
    () =>
      block?.contentType === "markdown"
        ? md2html(block.content, blockId.toString())
        : Promise.resolve(""),
    [
      block?.contentType,
      block?.contentType === "markdown" ? block.content : "",
    ],
  );

  useEffect(() => {
    if (block && mdHtml && router.query.blockId === blockId.toString()) {
      selfRef.current?.scrollIntoView();
    }
  }, [block, mdHtml, router, blockId]);

  return (
    <div ref={selfRef} className="rounded-md border relative group">
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
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="opacity-50 cursor-default"
                      >
                        <ScrollTextIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>History (to be implemented)</p>
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
                  <span className="text-[0.5rem]">
                    CTF: ASIS CTF 2023 Final
                  </span>
                </Badge>
              </div>
            </div>
          )}
          <div className="px-4 pb-2 pt-1 max-h-[50vh] overflow-auto">
            {block === undefined && (
              <BarLoader loading={true} color="white" className="my-2" />
            )}
            {block?.contentType === "code" && (
              <SyntaxHighlighter
                language={block.metadata.language}
                style={theme.resolvedTheme === "dark" ? vscDarkPlus : vs}
              >
                {block.content}
              </SyntaxHighlighter>
            )}
            {block?.contentType === "markdown" && (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: mdHtml ?? "" }}
              />
            )}
            {block?.contentType === "file" && (
              <div className="flex gap-2">
                {block.files.map((file) => (
                  <a target="_blank" href={file.url} key={file.url}>
                    <Button variant="outline">
                      <PaperclipIcon className="mr-2 h-4 w-4" /> {file.filename}
                    </Button>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {mode === "edit" && (
        <div className="px-4 py-2 space-y-2">
          <div className="font-medium">Editing block {blockId}</div>
          <BlockEditor
            cancellable
            initialValue={block}
            onCancel={() => setMode("view")}
            onSubmit={() => setMode("view")}
          />
        </div>
      )}
    </div>
  );
};
