interface CodeBlockProps {
  readonly code: string;
  readonly label: string;
}

export const CodeBlock = ({ code, label }: CodeBlockProps) => (
  <div className="border-ink/10 bg-ink overflow-hidden rounded-xl border">
    <div className="border-b border-white/10 px-4 py-2 font-mono text-xs tracking-[0.14em] text-white/50 uppercase">
      {label}
    </div>
    <pre className="text-canvas overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);
