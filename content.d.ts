// `content/<locale>/*.md`, compiled by `@next/mdx`, with the frontmatter that
// `remark-mdx-frontmatter` exports alongside the document.
declare module "*.md" {
  import type { MDXContent } from "mdx/types";

  export const frontmatter: {
    readonly description: string;
    readonly title: string;
  };

  const Content: MDXContent;
  export default Content;
}
