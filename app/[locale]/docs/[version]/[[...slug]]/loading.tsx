import { DocsPageSkeleton } from "#components/docs-page-skeleton";

// Shown while a URL renders for the first time, which Next.js then stores. That
// first response is a 200, so a 404 is marked `noindex` and a redirect is a
// meta refresh; later visits answer with the status itself.
const Loading = () => <DocsPageSkeleton />;

export default Loading;
