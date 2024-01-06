import { Block } from "@/components/block";
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { DefaultLayout } from "@/layouts/default";
import { cn } from "@/lib/utils";
import { PlusSquareIcon } from "lucide-react";
import { editor as monacoEditor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const theme = useTheme();

  return (
    <DefaultLayout>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className="!overflow-auto"
          defaultSize={20}
          minSize={10}
          maxSize={50}
        >
          <div className="flex flex-col">
            <div className="leading-4 text-ellipsis font-bold overflow-hidden whitespace-nowrap shrink-0 px-4 py-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <PlusSquareIcon size="1rem" className="inline h-4" />
              &nbsp;Add new post
            </div>
            <Separator />
            <div className="grow shrink basis-0">
              {new Array(100).fill(null).map((_, i) => (
                <>
                  <div
                    className={cn(
                      "px-4 py-2 space-y-1 cursor-pointer text-muted-foreground hover:text-foreground",
                      {
                        "text-foreground": router.query.postId === i.toString(),
                      },
                    )}
                    onClick={() => {
                      router.query.postId = i.toString();
                      router.push(router);
                    }}
                  >
                    <div className="text-md leading-none">Post {i + 1}</div>
                    <div>
                      <Badge variant="inherit">
                        <span className="text-xs">SECCON CTF</span>
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                </>
              ))}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="!overflow-auto">
          {router.query.postId !== undefined && (
            <div className="flex flex-col h-[100%]">
              <div className="px-4 py-2">
                <h1 className="text-xl font-bold">
                  Post {router.query.postId}
                </h1>
                <div>
                  <Badge variant="inherit">
                    <span className="text-xs">SECCON CTF</span>
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grow shrink basis-0 overflow-auto px-4 py-2">
                <div className="space-y-2">
                  {new Array(1000).fill(null).map((_, i) => (
                    <Block blockId={i + 1} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </DefaultLayout>
  );
}
