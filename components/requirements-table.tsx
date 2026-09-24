import { getTranslations } from "next-intl/server";

const requirements = [
  { key: "postgres", required: true },
  { key: "cache", required: true },
  { key: "storage", required: true },
  { key: "smtp", required: true },
  { key: "stripe", required: false },
  { key: "firebase", required: false },
  { key: "openTelemetry", required: false },
] as const;

export const RequirementsTable = async () => {
  const t = await getTranslations("requirements");

  return (
    <div className="border-border overflow-x-auto border-t pt-6">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="pb-6 text-left">
          <span className="font-display text-foreground block text-lg">
            {t("title")}
          </span>
          <span className="text-muted-foreground mt-1 block text-sm">
            {t("lead")}
          </span>
        </caption>
        <thead>
          <tr className="border-border text-muted-foreground border-b text-xs">
            <th className="py-3 pr-6 font-medium" scope="col">
              {t("dependency")}
            </th>
            <th className="py-3 font-medium" scope="col">
              {t("purpose")}
            </th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((requirement) => (
            <tr
              className="border-border border-b last:border-b-0"
              key={requirement.key}
            >
              <td className="text-foreground py-3 pr-6 align-top">
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {t(`items.${requirement.key}.name`)}
                  <span
                    className={
                      requirement.required
                        ? "border-primary text-primary rounded-sm border px-1.5 text-xs whitespace-nowrap"
                        : "border-border text-muted-foreground rounded-sm border px-1.5 text-xs whitespace-nowrap"
                    }
                  >
                    {requirement.required ? t("required") : t("optional")}
                  </span>
                </span>
              </td>
              <td className="text-muted-foreground py-3 align-top">
                {t(`items.${requirement.key}.purpose`)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
