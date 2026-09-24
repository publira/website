import { getTranslations } from "next-intl/server";
import Image from "next/image";

import heroImage from "#assets/screenshots/01-host-catalog-top.png";
import { BrowserFrame } from "#components/browser-frame";

const facts = [
  "nextApps",
  "goProcesses",
  "mobileClient",
  "readerLanguages",
  "license",
] as const;

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
          <a
            className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
            href="#screens"
          >
            {t("screens")}
          </a>
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
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t("status.body")}
          </p>
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
