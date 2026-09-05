import type { ReactNode } from "react";

interface SectionProps {
  readonly children: ReactNode;
  readonly eyebrow: string;
  readonly id: string;
  readonly lead?: string;
  readonly title: string;
  readonly tone?: "canvas" | "surface";
}

export const Section = ({
  children,
  eyebrow,
  id,
  lead,
  title,
  tone = "canvas",
}: SectionProps) => (
  <section
    className={
      tone === "surface"
        ? "border-line bg-canvas-deep/50 border-y py-20 sm:py-28"
        : "py-20 sm:py-28"
    }
    id={id}
  >
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <p className="text-terracotta text-xs tracking-[0.22em] uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-ink mt-3 max-w-3xl text-3xl leading-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">{lead}</p>
      ) : null}
      <div className="mt-12">{children}</div>
    </div>
  </section>
);
