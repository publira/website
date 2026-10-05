import { createAppAuth } from "@octokit/auth-app";

/**
 * The site's GitHub App, configured by `GITHUB_APP_ID` and
 * `GITHUB_APP_PRIVATE_KEY`, or `null` without them.
 */
const createAuth = () => {
  const appId = process.env.GITHUB_APP_ID ?? "";
  // A key pasted on one line keeps its line breaks as `\n`.
  const privateKey = (process.env.GITHUB_APP_PRIVATE_KEY ?? "").replaceAll(
    String.raw`\n`,
    "\n"
  );
  if (appId === "" && privateKey === "") {
    return null;
  }
  if (appId === "" || privateKey === "") {
    throw new Error(
      "The GitHub App is misconfigured: set both GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY"
    );
  }
  return createAppAuth({ appId, privateKey });
};

const auth = createAuth();

// The installation is looked up once per process; `createAppAuth` keeps its
// tokens, and asks for a new one before the old one expires.
const installationIds = new Map<string, Promise<number>>();

const findInstallation = async (repository: string) => {
  if (!auth) {
    throw new Error("The GitHub App is not configured");
  }
  const { token } = await auth({ type: "app" });
  const response = await fetch(
    `https://api.github.com/repos/${repository}/installation`,
    {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      `The GitHub App is not installed on ${repository}: GitHub responded with ${response.status}`
    );
  }
  // SAFETY: the shape GitHub documents for "Get a repository installation".
  const { id } = (await response.json()) as { readonly id: number };
  return id;
};

/**
 * A token that reads `repository`: the App's installation token, or, without
 * the App, `GITHUB_TOKEN`, which CI and local development set. `undefined`
 * with neither.
 */
export const getGitHubToken = async (repository: string) => {
  if (!auth) {
    return process.env.GITHUB_TOKEN || undefined;
  }

  const lookup =
    installationIds.get(repository) ?? findInstallation(repository);
  installationIds.set(repository, lookup);
  try {
    const { token } = await auth({
      installationId: await lookup,
      type: "installation",
    });
    return token;
  } catch (error) {
    // Look the installation up again next time rather than keep the failure.
    installationIds.delete(repository);
    throw error;
  }
};
