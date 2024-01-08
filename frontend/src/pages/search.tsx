import { Block } from "@/components/block";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefaultLayout } from "@/layouts/default";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const query = router.query["query"];

  useEffect(() => {
    if (router.isReady && typeof query !== "string") {
      router.push("/");
    }
  }, [query]);

  if (!router.isReady || typeof query !== "string") {
    return <DefaultLayout />;
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 pt-4 space-y-4">
      <h3 className="text-lg font-medium">Search result for {query}</h3>
      <Separator />
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="space-y-2">
            {new Array(10).fill(null).map((_, i) => (
              <Link href={`/?postId=${i + 1}`} legacyBehavior passHref>
                <a className="block">
                  <div className="rounded-md border px-4 py-2 space-y-1 cursor-pointer text-muted-foreground hover:text-foreground">
                    <div className="text-md leading-none">Post {i + 1}</div>
                    <div className="leading-[0]">
                      <Badge variant="inherit" className="px-2 py-0">
                        <span className="text-[0.5rem]">
                          CTF: ASIS CTF 2023 Final
                        </span>
                      </Badge>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="blocks">
          <div className="space-y-2">
            {new Array(10).fill(null).map((_, i) => (
              <Link
                href={`/?postId=${i + 1}&blockId=${i + 1}`}
                legacyBehavior
                passHref
              >
                <a className="block">
                  <div className="text-muted-foreground hover:text-foreground">
                    <Block
                      postId={i + 1}
                      postTitle={`Post ${i + 1}`}
                      blockId={i + 1}
                    />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
