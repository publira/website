interface CodeBlockProps {
  readonly code: string;
  readonly label: string;
}

export const CodeBlock = ({ code, label }: CodeBlockProps) => (
  <div className="border-line bg-canvas-deep overflow-hidden rounded-lg border">
    <div className="border-line text-ink-soft border-b px-4 py-2 font-mono text-xs">
      {label}
    </div>
    <pre className="text-ink overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);
