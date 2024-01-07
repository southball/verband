import { Block } from "@/components/block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCombinedRefs } from "@/lib/react";
import { cn } from "@/lib/utils";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { PlusIcon, PlusSquareIcon, SendIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const monaco = useMonaco();
  const [intersectionObserverRef, entry] = useIntersectionObserver();
  const addBlockFormRef = useRef<HTMLDivElement | null>();
  const addBlockFormCombinedRef = useCombinedRefs<Element | null | undefined>(
    intersectionObserverRef,
    addBlockFormRef,
  );
  const languages = monaco?.languages.getLanguages();
  const [language, setLanguage] = useState("");

  const [markdown, setMarkdown] = useState("");
  const [markdownHtml, setMarkdownHtml] = useState("");

  useEffect(() => {
    void (async () => {
      setMarkdownHtml(DOMPurify(window).sanitize(await marked.parse(markdown)));
    })();
  }, [markdown]);

  const showAddBlockForm = () => {
    addBlockFormRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({ maxFiles: 1 });

  return (
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
          <div className="static h-[100%]">
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
                  {new Array(100).fill(null).map((_, i) => (
                    <Block showActions blockId={i + 1} />
                  ))}
                  <div
                    className="rounded-md border px-4 py-2 space-y-2"
                    ref={addBlockFormCombinedRef as any}
                  >
                    <Tabs defaultValue="markdown">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="file">File</TabsTrigger>
                      </TabsList>
                      <TabsContent value="markdown">
                        <div className="h-[50vh]">
                          <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel>
                              <MonacoEditor
                                height="100%"
                                language="markdown"
                                theme={
                                  theme.resolvedTheme === "dark"
                                    ? "vs-dark"
                                    : "vs"
                                }
                                onChange={(value) => setMarkdown(value ?? "")}
                              />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel>
                              <div
                                className="px-4 py-2"
                                dangerouslySetInnerHTML={{
                                  __html: markdownHtml,
                                }}
                              />
                            </ResizablePanel>
                          </ResizablePanelGroup>
                        </div>
                      </TabsContent>
                      <TabsContent value="code">
                        <div className="space-y-2">
                          <Select onValueChange={(value) => setLanguage(value)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {languages?.map((language) => (
                                  <SelectItem value={language.id}>
                                    {language.id}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <MonacoEditor
                            language={language}
                            height="50vh"
                            theme={
                              theme.resolvedTheme === "dark" ? "vs-dark" : "vs"
                            }
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="file">
                        <div
                          {...getRootProps()}
                          className={cn(
                            "h-[160px] w-full border flex flex-col justify-center items-center",
                            { "border-foreground": isDragActive },
                          )}
                        >
                          <input {...getInputProps()} />
                          <p>
                            File selected:{" "}
                            {acceptedFiles.length > 0 ? (
                              <code>{acceptedFiles[0].name}</code>
                            ) : (
                              "none"
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            Click to select file, or drop file here...
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="flex justify-end">
                      <Button>
                        <SendIcon className="mr-2 h-4 w-4" /> Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn("absolute right-4 bottom-4 transition-all", {
                "opacity-0 pointer-events-none": entry?.isIntersecting,
              })}
            >
              <Button
                size="icon"
                className="rounded-full"
                onClick={showAddBlockForm}
              >
                <PlusIcon size="1rem" />
              </Button>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
