import type { ReactNode } from "react";

interface SectionProps {
  readonly children: ReactNode;
  readonly id: string;
  readonly lead?: string;
  readonly title: string;
  readonly tone?: "canvas" | "surface";
}

export const Section = ({
  children,
  id,
  lead,
  title,
  tone = "canvas",
}: SectionProps) => (
  <section
    className={
      tone === "surface"
        ? "border-line border-t py-20 sm:py-24"
        : "py-20 sm:py-24"
    }
    id={id}
  >
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <h2 className="font-display text-ink max-w-3xl text-4xl text-balance">
        {title}
      </h2>
      {lead ? (
        <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">{lead}</p>
      ) : null}
      <div className="mt-12">{children}</div>
    </div>
  </section>
);
