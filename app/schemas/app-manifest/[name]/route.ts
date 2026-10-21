import { getAppManifestSchema } from "#lib/app-manifest-schema";

// Not `immutable`: the file on `main` changes under the same URL.
const cacheControl = "public, max-age=3600, stale-while-revalidate=86400";

// Outside `[locale]`, since a schema is not localized. Its URL names the
// format rather than a release, so a tenant's `$schema` line outlives upgrades.
const serveSchema = async (
  _request: Request,
  { params }: RouteContext<"/schemas/app-manifest/[name]">
) => {
  const { name } = await params;
  const schema = await getAppManifestSchema(name);
  if (!schema) {
    return new Response(null, { status: 404 });
  }

  return new Response(schema, {
    headers: {
      // Editors in the browser fetch the schema from their own origin.
      "access-control-allow-origin": "*",
      "cache-control": cacheControl,
      "content-type": "application/schema+json",
      "x-content-type-options": "nosniff",
    },
  });
};

export { serveSchema as GET };
