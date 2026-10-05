import { redirect } from "next/navigation";

import { getCurrentVersion, getDocsPath } from "#lib/docs";

// `/docs` opens the newest version. It shows nothing of its own, so it is a
// Route Handler rather than a page.
const redirectToCurrentVersion = async () => {
  redirect(getDocsPath(await getCurrentVersion()));
};

export { redirectToCurrentVersion as GET };
