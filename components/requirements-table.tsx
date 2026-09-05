const requirements = [
  {
    name: "PostgreSQL",
    purpose:
      "The catalog, tenants, users, and the audit log. Each server connects as its own role.",
  },
  {
    name: "A Redis-compatible cache",
    purpose:
      "The shared Next.js cache, so a deployment can run more than one instance behind a load balancer.",
  },
  {
    name: "S3-compatible object storage",
    purpose:
      "Episode images and other uploads, delivered through the image servers.",
  },
  {
    name: "An SMTP relay",
    purpose:
      "Notifications and tenant mail, configured per platform and per tenant.",
  },
  {
    name: "An OpenTelemetry collector",
    purpose:
      "Optional. Traces from the Next.js apps and the Go servers; off unless enabled.",
  },
];

export const RequirementsTable = () => (
  <div className="border-line bg-surface overflow-x-auto rounded-xl border">
    <table className="w-full border-collapse text-left text-sm">
      <caption className="border-line border-b px-6 py-4 text-left">
        <span className="font-display text-ink text-lg">
          What it needs to run
        </span>
        <span className="text-ink-soft mt-1 block text-sm">
          Ordinary infrastructure with no managed service behind it — bring your
          own, or keep the ones a checkout brings up for you.
        </span>
      </caption>
      <thead>
        <tr className="bg-canvas-deep/50 text-ink-soft text-xs tracking-[0.14em] uppercase">
          <th className="px-6 py-3 font-medium" scope="col">
            Dependency
          </th>
          <th className="px-6 py-3 font-medium" scope="col">
            What it holds
          </th>
        </tr>
      </thead>
      <tbody>
        {requirements.map((requirement) => (
          <tr className="border-line border-t" key={requirement.name}>
            <td className="text-ink px-6 py-3">{requirement.name}</td>
            <td className="text-ink-soft px-6 py-3">{requirement.purpose}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
