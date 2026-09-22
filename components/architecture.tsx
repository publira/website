const layers = [
  { label: "Clients", nodes: ["Browser", "Flutter app"] },
  { label: "Web (Next.js)", nodes: ["web-host", "web-admin", "web-platform"] },
  { label: "Transport", nodes: ["Connect RPC over Protocol Buffers"] },
  {
    label: "Servers (Go)",
    nodes: ["api-server", "image-server", "outbox-worker", "batch"],
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
  <div className="border-border border-l pl-5">
    <ol>
      {layers.map((layer) => (
        <li
          className="border-border grid gap-2 border-b py-4 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-baseline"
          key={layer.label}
        >
          <span className="text-muted-foreground text-sm">{layer.label}</span>
          <span className="flex flex-wrap gap-y-1">
            {layer.nodes.map((node) => (
              <span
                className="border-border text-foreground border-l px-3 text-sm tabular-nums first:border-l-0 first:pl-0"
                key={node}
              >
                {node}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ol>
    <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
      One <code>api-server</code> process carries the public, admin, and
      platform namespaces, and one <code>image-server</code> answers both the
      reader’s origin and the console’s. Beside them the outbox worker delivers
      the mail and runs the periodic jobs that promote due episodes, apply the
      free-window boundaries, and turn over each tenant’s calendar day;{" "}
      <code>batch</code> holds the one-shot jobs behind a subcommand.
    </p>
    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
      Every layer is instrumented with{" "}
      <strong className="text-foreground font-medium">OpenTelemetry</strong>, so
      one browser request reads as a single trace: the Next.js root span, the
      Connect RPC it makes during SSR, the identically named span on the Go
      side, and the <code>db.query</code> children below it. Point it at
      whatever collector you already run, or leave tracing off — it is disabled
      by default.
    </p>
  </div>
);
