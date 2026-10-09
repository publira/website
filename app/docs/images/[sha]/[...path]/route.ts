import { createDocsImageResponse, findDocsImage } from "#lib/docs";

// An image at the URL that names its blob, which only ever serves that blob.
// `images` sits where a version would, and no version is named so.
const serveImage = async (
  _request: Request,
  { params }: RouteContext<"/docs/images/[sha]/[...path]">
) => {
  const { path, sha } = await params;
  const image = await findDocsImage(sha, path);
  if (!image) {
    return new Response(null, { status: 404 });
  }

  return createDocsImageResponse(image, {
    "cache-control": "public, max-age=31536000, immutable",
  });
};

export { serveImage as GET };
