import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

// Each node carries its whole key, so the key of every node is checked
// against the catalog rather than combined with each layer's key.
const layers = [
  {
    key: "clients",
    nodes: ["clients.nodes.browser", "clients.nodes.flutter"],
  },
  {
    key: "web",
    nodes: ["web.nodes.host", "web.nodes.admin", "web.nodes.platform"],
  },
  { key: "transport", nodes: ["transport.nodes.connect"] },
  { key: "servers", nodes: ["servers.nodes.server", "servers.nodes.worker"] },
  {
    key: "infrastructure",
    nodes: [
      "infrastructure.nodes.postgres",
      "infrastructure.nodes.cache",
      "infrastructure.nodes.storage",
      "infrastructure.nodes.smtp",
    ],
  },
] as const;

const code = (chunks: ReactNode) => <code>{chunks}</code>;

const strong = (chunks: ReactNode) => (
  <strong className="text-foreground font-medium">{chunks}</strong>
);

export const Architecture = async () => {
  const t = await getTranslations("architecture");

  return (
    <div className="border-border border-l pl-5">
      <ol>
        {layers.map((layer) => (
          <li
            className="border-border grid gap-2 border-b py-4 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-baseline"
            key={layer.key}
          >
            <span className="text-muted-foreground text-sm">
              {t(`layers.${layer.key}.label`)}
            </span>
            <span className="flex flex-wrap gap-y-1">
              {layer.nodes.map((node) => (
                <span
                  className="border-border text-foreground border-l px-3 text-sm tabular-nums first:border-l-0 first:pl-0"
                  key={node}
                >
                  {t(`layers.${node}`)}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
        {t.rich("processes", { code })}
      </p>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        {t.rich("tracing", { code, strong })}
      </p>
    </div>
  );
};
