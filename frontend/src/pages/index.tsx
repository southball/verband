import { Block } from "@/components/block";
import { BlockEditor } from "@/components/block-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PlusIcon, PlusSquareIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useIntersection } from "react-use";

export default function Home() {
  const router = useRouter();
  const addBlockFormRef = useRef<HTMLDivElement | null>(null);
  const addBlockFormIntersection = useIntersection(addBlockFormRef, {});

  const showAddBlockForm = () => {
    addBlockFormRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const form = useForm();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="!overflow-auto"
        defaultSize={20}
        minSize={10}
        maxSize={50}
      >
        <div className="flex flex-col">
          <Drawer>
            <DrawerTrigger>
              <div className="leading-4 text-ellipsis font-bold overflow-hidden whitespace-nowrap shrink-0 px-4 py-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <PlusSquareIcon size="1rem" className="inline h-4" />
                &nbsp;Add new post
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm flex flex-col">
                <DrawerHeader>
                  <DrawerTitle>Create Post</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="BabyWAF" {...field} />
                            </FormControl>
                            <FormDescription>
                              Title of the post.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
                <DrawerFooter>
                  <Button>Create</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
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
      <ResizableHandle withHandle />
      <ResizablePanel className="!overflow-auto">
        {router.query.postId === undefined && (
          <div className="h-[100%] flex justify-center items-center text-muted-foreground text-xl">
            Please select a post from the left.
          </div>
        )}
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
                    <Block
                      showActions
                      postId={+(router.query.postId ?? "0")}
                      blockId={i + 1}
                    />
                  ))}
                  <div
                    className="rounded-md border px-4 py-2 space-y-2"
                    ref={addBlockFormRef}
                  >
                    <BlockEditor />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn("absolute right-4 bottom-4 transition-all", {
                "opacity-0 pointer-events-none":
                  addBlockFormIntersection?.isIntersecting ?? false,
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
