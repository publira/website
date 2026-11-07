import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";

import heroImage from "#assets/screenshots/host/catalog-plain.png";
import { BrowserFrame } from "#components/browser-frame";
import { Link } from "#i18n/navigation";
import { skipGitHubInBuild } from "#lib/docs";
import { resolveLatestRelease } from "#lib/latest-release";

const facts = [
  "nextApps",
  "goProcesses",
  "mobileClient",
  "readerLanguages",
  "license",
] as const;

/** Where development stands, naming the newest release once it is read. */
const Status = async ({ release }: { readonly release: string | null }) => {
  const t = await getTranslations("hero");

  return (
    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
      {t("status.body", { version: release ?? "none" })}
    </p>
  );
};

const ReleaseStatus = async () => {
  "use cache: remote";

  if (skipGitHubInBuild()) {
    return null;
  }

  const { release, resolved } = await resolveLatestRelease();

  if (resolved) {
    cacheLife("max");
  } else {
    cacheLife("minutes");
  }

  return <Status release={release} />;
};

export const Hero = async () => {
  const t = await getTranslations("hero");

  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <h1 className="font-display text-foreground break-phrase max-w-4xl text-4xl leading-[1.15] text-balance sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
          {t("lead")}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            className="bg-secondary text-secondary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
            href="https://github.com/publira/publira"
            rel="noreferrer"
            target="_blank"
          >
            {t("github")}
          </a>
          <Link
            className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
            href="/docs"
          >
            {t("docs")}
          </Link>
          <Link
            className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
            href="/screenshots"
          >
            {t("screens")}
          </Link>
        </div>

        <dl className="border-border mt-12 max-w-2xl border-t text-sm">
          {facts.map((fact) => (
            <div
              className="border-border flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0"
              key={fact}
            >
              <dt className="text-muted-foreground">
                {t(`facts.${fact}.label`)}
              </dt>
              <dd className="text-foreground tabular-nums">
                {t(`facts.${fact}.value`)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-border mt-10 max-w-2xl border-t pt-6">
          <p className="text-foreground text-sm font-medium">
            {t("status.title")}
          </p>
          <Suspense fallback={<Status release={null} />}>
            <ReleaseStatus />
          </Suspense>
        </div>

        <figure className="mt-14">
          <BrowserFrame address="publisher.example / catalog">
            <Image
              alt={t("screenshot.alt")}
              className="w-full"
              placeholder="blur"
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
              src={heroImage}
            />
          </BrowserFrame>
          <figcaption className="text-muted-foreground mt-3 text-sm">
            {t("screenshot.caption")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
};
