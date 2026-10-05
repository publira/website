import { getBlob, getDocsTree } from "#lib/docs";

// An image a document shows, from the same version's tree. The pages are
// rendered under `[locale]`, which the proxy does not send a file to.
const serveImage = async (
  request: Request,
  { params }: RouteContext<"/docs/[version]/[...path]">
) => {
  const { path, version } = await params;
  const tree = await getDocsTree(version);
  const image = tree?.images.find(
    ({ slug }) => slug.join("/") === path.join("/")
  );
  if (!image) {
    return new Response(null, { status: 404 });
  }

  // The blob's hash names its content, so a browser can keep the image until
  // the version's tree points at another one.
  const etag = `"${image.sha}"`;
  const headers = { "cache-control": "public, no-cache", etag };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { headers, status: 304 });
  }

  return new Response(await getBlob(image.sha), {
    headers: {
      ...headers,
      // An SVG opened on its own runs no script and loads nothing.
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "content-type": image.type,
      "x-content-type-options": "nosniff",
    },
  });
};

export { serveImage as GET };
