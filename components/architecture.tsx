const layers = [
  { label: "Clients", nodes: ["Browser", "Mobile app"], tone: "sage" },
  {
    label: "Web · Next.js",
    nodes: ["web-host", "web-admin", "web-platform"],
    tone: "terracotta",
  },
  {
    label: "Transport",
    nodes: ["Connect RPC over Protocol Buffers"],
    tone: "ink",
  },
  {
    label: "API · Go",
    nodes: [
      "api-server",
      "admin-api-server",
      "platform-api-server",
      "image-server",
      "admin-image-server",
    ],
    tone: "teal",
  },
  {
    label: "Infrastructure",
    nodes: [
      "PostgreSQL",
      "Redis-compatible cache",
      "S3-compatible storage",
      "SMTP",
    ],
    tone: "teal",
  },
] as const;

const nodeTone = {
  ink: "border-ink/20 bg-canvas-deep text-ink",
  sage: "border-sage/30 bg-sage-soft text-ink",
  teal: "border-teal/25 bg-teal-soft text-ink",
  terracotta: "border-terracotta/30 bg-terracotta-soft text-ink",
};

export const Architecture = () => (
  <div className="border-line bg-surface rounded-xl border p-6 sm:p-8">
    <ol className="space-y-3">
      {layers.map((layer, index) => (
        <li key={layer.label}>
          {index > 0 ? (
            <div
              aria-hidden="true"
              className="bg-line mb-3 h-4 w-px sm:ml-[4.5rem]"
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[9rem_1fr] sm:items-center">
            <span className="text-ink-soft text-xs tracking-[0.16em] uppercase">
              {layer.label}
            </span>
            <span className="flex flex-wrap gap-2">
              {layer.nodes.map((node) => (
                <span
                  className={`rounded-lg border px-3 py-2 font-mono text-[0.75rem] ${nodeTone[layer.tone]}`}
                  key={node}
                >
                  {node}
                </span>
              ))}
            </span>
          </div>
        </li>
      ))}
    </ol>
    <p className="border-line text-ink-soft mt-8 border-t pt-6 text-sm leading-relaxed">
      Every layer is instrumented with{" "}
      <strong className="text-ink">OpenTelemetry</strong>, so one browser
      request reads as a single trace: the Next.js root span, the Connect RPC it
      makes during SSR, the identically named span on the Go side, and the{" "}
      <code className="font-mono">db.query</code> children below it. Point it at
      whatever collector you already run, or leave tracing off — it is disabled
      by default.
    </p>
  </div>
);
