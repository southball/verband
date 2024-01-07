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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import DOMPurify from "dompurify";
import { debounce, initial } from "lodash";
import { SendIcon, XIcon } from "lucide-react";
import { marked } from "marked";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { BlockData } from "./block";
import { md2html } from "@/lib/markdown";

type BlockEditorProps = {
  cancellable?: boolean;
  initialValue?: BlockData;
  onCancel?: () => void;
  onSubmit?: () => void;
};

export const BlockEditor = ({
  cancellable,
  initialValue,
  onCancel,
  onSubmit,
}: BlockEditorProps) => {
  const theme = useTheme();
  const monaco = useMonaco();
  const languages = monaco?.languages.getLanguages();
  const [language, setLanguage] = useState(
    initialValue?.contentType === "code" ? initialValue.metadata.language : "",
  );

  const [markdown, setMarkdown] = useState(
    initialValue?.contentType === "markdown" ? initialValue.content : "",
  );
  const [markdownHtml, setMarkdownHtml] = useState("");

  const debouncedSetMarkdown = useCallback(debounce(setMarkdown, 200), [
    setMarkdown,
  ]);

  useEffect(() => {
    void (async () => {
      try {
        setMarkdownHtml(await md2html(markdown));
      } catch (err) {
        setMarkdownHtml(DOMPurify(window).sanitize(err?.toString() ?? ""));
      }
    })();
  }, [markdown]);

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({ maxFiles: 1 });

  return (
    <>
      <Tabs defaultValue={initialValue?.contentType ?? "markdown"}>
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
                  theme={theme.resolvedTheme === "dark" ? "vs-dark" : "vs"}
                  onChange={(value) => debouncedSetMarkdown(value ?? "")}
                  defaultValue={
                    initialValue?.contentType === "markdown"
                      ? initialValue.content
                      : ""
                  }
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel className="!overflow-auto">
                <div
                  className="px-4 py-2 markdown-content"
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
            <Select
              onValueChange={(value) => setLanguage(value)}
              value={language}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {languages?.map((language) => (
                    <SelectItem value={language.id}>{language.id}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <MonacoEditor
              language={language}
              height="50vh"
              theme={theme.resolvedTheme === "dark" ? "vs-dark" : "vs"}
              defaultValue={
                initialValue?.contentType === "code" ? initialValue.content : ""
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
      <div className="flex justify-end gap-2">
        {cancellable && (
          <Button variant="secondary" onClick={() => onCancel?.()}>
            <XIcon className="mr-2 h-4 w-4" /> Cancel
          </Button>
        )}
        <Button onClick={() => onSubmit?.()}>
          <SendIcon className="mr-2 h-4 w-4" /> Create Block
        </Button>
      </div>
    </>
  );
};
