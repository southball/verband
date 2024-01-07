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

const dummyBlocks: BlockData[] = [
  {
    contentType: "markdown",
    content: `
$f\\relax{x} = \\int_{-\\infty}^\\infty f\\hat\\xi\\,e^{2 \\pi i \\xi x}\\,d\\xi$

$$f\\relax{x} = \\int_{-\\infty}^\\infty f\\hat\\xi\\,e^{2 \\pi i \\xi x}\\,d\\xi$$

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as \`1.\`

Start numbering with offset:

57. foo
1. bar


## Code

Inline \`code\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"


## Plugins

The killer feature of \`markdown-it\` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


### [Emojies](https://github.com/markdown-it/markdown-it-emoji)

> Classic markup: :wink: :cry: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.


### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

- 19^th^
- H~2~O


### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++


### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==


### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.


### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b


### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.

*[HTML]: Hyper Text Markup Language

### [Custom containers](https://github.com/markdown-it/markdown-it-container)

::: warning
*here be dragons*
:::
`,
  },
  {
    contentType: "code",
    content: "#include <bits/stdc++.h>",
    metadata: { language: "cpp" },
  },
  {
    contentType: "file",
    files: [
      { url: "/a.txt", filename: "a.txt" },
      { url: "/b.bin", filename: "b.bin" },
    ],
  },
];

export const Block: React.FC<BlockProps> = ({
  blockId,
  postId,
  postTitle,
  showActions,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [block] = useState<BlockData>(dummyBlocks[blockId % 3]);
  const selfRef = useRef<HTMLDivElement | null>(null);
  const { value: mdHtml } = useAsync(() =>
    block.contentType === "markdown"
      ? md2html(block.content, blockId.toString())
      : Promise.resolve(""),
  );

  useEffect(() => {
    if (router.query.blockId === blockId.toString()) {
      selfRef.current?.scrollIntoView();
    }
  }, [router, blockId]);

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
          <div className="px-4 pb-2 pt-1 max-h-[50vh] overflow-auto">
            {block.contentType === "code" && (
              <SyntaxHighlighter
                language={block.metadata.language}
                style={theme.resolvedTheme === "dark" ? vscDarkPlus : vs}
              >
                {block.content}
              </SyntaxHighlighter>
            )}
            {block.contentType === "markdown" && (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: mdHtml ?? "" }}
              />
            )}
            {block.contentType === "file" && (
              <div className="flex gap-2">
                {block.files.map((file) => (
                  <a target="_blank" href={file.url}>
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
