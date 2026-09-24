import type { MDXComponents } from "mdx/types";

// The documents under `content/` are plain Markdown, so each element they can
// produce takes the site's type styles here.
const components = {
  a: ({ children, ...props }) => (
    <a className="text-primary underline" {...props}>
      {children}
    </a>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="font-display text-foreground break-phrase mt-12 text-2xl text-balance"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-foreground mt-8 font-medium" {...props}>
      {children}
    </h3>
  ),
  li: (props) => <li className="pl-1" {...props} />,
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed"
      {...props}
    />
  ),
  p: (props) => <p className="mt-4 leading-relaxed" {...props} />,
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed" {...props} />
  ),
} satisfies MDXComponents;

export const useMDXComponents = (): MDXComponents => components;
