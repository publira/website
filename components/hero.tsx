import Image from "next/image";

import { BrowserFrame } from "#components/browser-frame";
import { heroScreenshot } from "#lib/screenshots";

const facts = [
  { label: "Next.js apps", value: "3" },
  { label: "Go services", value: "5" },
  { label: "Companion libraries", value: "2" },
  { label: "License", value: "Apache-2.0" },
];

export const Hero = () => (
  <section>
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
      <h1 className="font-display text-ink max-w-4xl text-4xl leading-[1.15] text-balance sm:text-5xl">
        The open-source gateway to your digital publishing utopia.
      </h1>
      <p className="text-ink-soft mt-6 max-w-2xl text-lg leading-relaxed">
        Publira is a multi-tenant SaaS that gives publishers with limited IT
        resources a digital distribution platform for manga and novels, run
        under their own brand. Editors submit the book information they receive
        from creators, and readers read it on the web or on mobile.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          className="bg-shu text-canvas hover:bg-ink rounded-sm px-5 py-2.5 text-sm font-medium"
          href="https://github.com/publira/publira"
          rel="noreferrer"
          target="_blank"
        >
          publira/publira on GitHub
        </a>
        <a
          className="border-ai text-ai hover:bg-ai-soft rounded-sm border px-5 py-2.5 text-sm font-medium"
          href="#screens"
        >
          See the screens
        </a>
      </div>

      <dl className="border-line mt-12 max-w-2xl border-t text-sm">
        {facts.map((fact) => (
          <div
            className="border-line flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0"
            key={fact.label}
          >
            <dt className="text-ink-soft">{fact.label}</dt>
            <dd className="text-ink tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-line mt-10 max-w-2xl border-t pt-6">
        <p className="text-ink text-sm font-medium">Still being built</p>
        <p className="text-ink-soft mt-2 text-sm leading-relaxed">
          Publira is under active development and has not reached a stable
          release. Everything shown on this page runs today, but running it for
          a real publisher is not a matter of installing it as-is: expect to
          read the code, adapt it to your own environment, and follow changes
          that are still landing. Take it as something to evaluate, build on,
          and contribute to — not as a finished product.
        </p>
      </div>

      <figure className="mt-14">
        <BrowserFrame address="publisher.example / catalog">
          <Image
            alt="The Publira reader-facing catalog, showing recommended series"
            className="w-full"
            placeholder="blur"
            priority
            sizes="(min-width: 1280px) 1152px, 100vw"
            src={heroScreenshot.image}
          />
        </BrowserFrame>
        <figcaption className="text-ink-soft mt-3 text-sm">
          {heroScreenshot.caption}
        </figcaption>
      </figure>
    </div>
  </section>
);
