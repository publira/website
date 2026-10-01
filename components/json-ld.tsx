import type { StructuredDataNode } from "#lib/structured-data";

interface JsonLdProps {
  /** Nodes that point at each other, and at other pages' nodes, by `@id`. */
  readonly graph: readonly StructuredDataNode[];
}

/** Structured data for search engines, as a JSON-LD graph. */
export const JsonLd = ({ graph }: JsonLdProps) => (
  <script
    // `JSON.stringify` leaves `<` alone, so a `</script>` in a string would
    // end the element. Escaped, it reads the same as JSON.
    // oxlint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph,
      }).replaceAll("<", String.raw`<`),
    }}
    type="application/ld+json"
  />
);
