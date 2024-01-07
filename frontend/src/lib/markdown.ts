import DOMPurify from "dompurify";
import { Marked } from "marked";
import markedFootnote from "marked-footnote";
import markedKatex from "marked-katex-extension";
import prism from "prismjs";
import { markedHighlight } from "marked-highlight";

export const md2html = async (md: string, token?: string) =>
  DOMPurify(window).sanitize(
    await new Marked()
      .use(markedFootnote({ prefixId: `footnote-${token ?? "default"}-` }))
      .use(markedKatex({ output: "html" }))
      .use(
        markedHighlight({
          langPrefix: "language-",
          highlight(code, lang, _info) {
            if (prism.languages[lang]) {
              return prism.highlight(code, prism.languages[lang], lang);
            } else {
              return code;
            }
          },
        }),
      )
      .parse(md),
  );
