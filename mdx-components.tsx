import type { MDXComponents } from "mdx/types";

// The documents under `content/`, and the documentation read from
// publira/publira, are plain Markdown, so each element they can produce takes
// the site's type styles here.
export const mdxComponents = {
  a: ({ children, ...props }) => (
    <a className="text-primary underline" {...props}>
      {children}
    </a>
  ),
  blockquote: (props) => (
    <blockquote className="border-border mt-4 border-l-2 pl-4" {...props} />
  ),
  code: (props) => (
    <code
      className="bg-muted text-foreground rounded-sm px-1 py-0.5 text-[0.875em] in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-[inherit] in-[td]:whitespace-nowrap"
      {...props}
    />
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
  hr: (props) => <hr className="border-border my-10" {...props} />,
  img: ({ alt, ...props }) => (
    // The size of an image in a document is not known ahead of time.
    // oxlint-disable-next-line nextjs/no-img-element, react-doctor/nextjs-no-img-element
    <img
      alt={alt}
      className="border-border mt-6 rounded-md border"
      loading="lazy"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed"
      {...props}
    />
  ),
  p: (props) => <p className="mt-4 leading-relaxed" {...props} />,
  pre: (props) => (
    <pre
      className="border-border bg-muted text-foreground mt-6 overflow-x-auto rounded-lg border px-4 py-4 font-mono text-[0.8rem] leading-relaxed"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  td: (props) => (
    <td
      className="border-border border-b py-3 pr-6 align-top last:pr-0"
      {...props}
    />
  ),
  th: (props) => (
    <th
      className="border-border text-foreground border-b py-3 pr-6 align-bottom font-medium last:pr-0"
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed" {...props} />
  ),
} satisfies MDXComponents;

export const useMDXComponents = (): MDXComponents => mdxComponents;
