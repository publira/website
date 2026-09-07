const layers = [
  { label: "Clients", nodes: ["Browser", "Mobile app"] },
  { label: "Web (Next.js)", nodes: ["web-host", "web-admin", "web-platform"] },
  { label: "Transport", nodes: ["Connect RPC over Protocol Buffers"] },
  {
    label: "API (Go)",
    nodes: [
      "api-server",
      "admin-api-server",
      "platform-api-server",
      "image-server",
      "admin-image-server",
    ],
  },
  {
    label: "Infrastructure",
    nodes: [
      "PostgreSQL",
      "Redis-compatible cache",
      "S3-compatible storage",
      "SMTP",
    ],
  },
] as const;

export const Architecture = () => (
  <div className="border-line border-l pl-5">
    <ol>
      {layers.map((layer) => (
        <li
          className="border-line grid gap-2 border-b py-4 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-baseline"
          key={layer.label}
        >
          <span className="text-ink-soft text-sm">{layer.label}</span>
          <span className="flex flex-wrap gap-y-1">
            {layer.nodes.map((node) => (
              <span
                className="border-line text-ink border-l px-3 text-sm tabular-nums first:border-l-0 first:pl-0"
                key={node}
              >
                {node}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ol>
    <p className="text-ink-soft mt-6 text-sm leading-relaxed">
      Every layer is instrumented with{" "}
      <strong className="text-ink font-medium">OpenTelemetry</strong>, so one
      browser request reads as a single trace: the Next.js root span, the
      Connect RPC it makes during SSR, the identically named span on the Go
      side, and the <code>db.query</code> children below it. Point it at
      whatever collector you already run, or leave tracing off — it is disabled
      by default.
    </p>
  </div>
);
