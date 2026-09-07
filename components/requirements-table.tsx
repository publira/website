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
  <div className="border-line overflow-x-auto border-t pt-6">
    <table className="w-full border-collapse text-left text-sm">
      <caption className="pb-6 text-left">
        <span className="font-display text-ink block text-lg">
          What it needs to run
        </span>
        <span className="text-ink-soft mt-1 block text-sm">
          Ordinary infrastructure with no managed service behind it — bring your
          own, or keep the ones a checkout brings up for you.
        </span>
      </caption>
      <thead>
        <tr className="border-line text-ink-soft border-b text-xs">
          <th className="py-3 pr-6 font-medium" scope="col">
            Dependency
          </th>
          <th className="py-3 font-medium" scope="col">
            What it holds
          </th>
        </tr>
      </thead>
      <tbody>
        {requirements.map((requirement) => (
          <tr
            className="border-line border-b last:border-b-0"
            key={requirement.name}
          >
            <td className="text-ink py-3 pr-6 align-top">{requirement.name}</td>
            <td className="text-ink-soft py-3 align-top">
              {requirement.purpose}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
