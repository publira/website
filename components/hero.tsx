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
  <section className="relative overflow-hidden">
    <div
      aria-hidden="true"
      className="from-terracotta-soft/50 via-canvas to-canvas absolute inset-x-0 top-0 -z-10 h-[32rem] bg-linear-to-b"
    />
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
      <p className="text-terracotta text-xs tracking-[0.22em] uppercase">
        Open source · Multi-tenant publishing
      </p>
      <h1 className="font-display text-ink mt-5 max-w-4xl text-4xl leading-[1.1] text-balance sm:text-6xl">
        The open-source gateway to your digital publishing utopia.
      </h1>
      <p className="text-ink-soft mt-6 max-w-2xl text-lg leading-relaxed">
        Publira is a multi-tenant SaaS that gives publishers with limited IT
        resources a digital distribution platform for manga and novels, run
        under their own brand. Editors submit the book information they receive
        from creators, and readers read it on the web or on mobile.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <a
          className="bg-terracotta hover:bg-ink rounded-full px-6 py-3 text-sm font-medium text-white transition-colors"
          href="https://github.com/publira/publira"
          rel="noreferrer"
          target="_blank"
        >
          publira/publira on GitHub
        </a>
        <a
          className="border-ink/15 bg-surface text-ink hover:border-teal hover:text-teal rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          href="#screens"
        >
          See the screens
        </a>
      </div>

      <aside className="border-line bg-surface mt-10 max-w-2xl rounded-xl border p-5 sm:p-6">
        <p className="text-terracotta text-xs tracking-[0.22em] uppercase">
          Still being built
        </p>
        <p className="text-ink-soft mt-3 text-sm leading-relaxed">
          Publira is under active development and has not reached a stable
          release. Everything shown on this page runs today, but running it for
          a real publisher is not a matter of installing it as-is: expect to
          read the code, adapt it to your own environment, and follow changes
          that are still landing. Take it as something to evaluate, build on,
          and contribute to — not as a finished product.
        </p>
      </aside>

      <dl className="border-line bg-line mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
        {facts.map((fact) => (
          <div className="bg-surface px-5 py-5" key={fact.label}>
            <dt className="text-ink-soft text-xs tracking-[0.14em] uppercase">
              {fact.label}
            </dt>
            <dd className="font-display text-ink mt-2 text-2xl">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <figure className="mt-14">
        <BrowserFrame address="publisher.example / catalog">
          <Image
            alt="The Publira reader-facing catalog, showing recommended series"
            className="border-line w-full border-t"
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
