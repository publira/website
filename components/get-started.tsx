import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { CodeBlock } from "#components/code-block";
import { Link } from "#i18n/navigation";
import { resolveCurrentDocsPath, skipGitHubInBuild } from "#lib/docs";
import { resolveLatestRelease } from "#lib/latest-release";

/**
 * The download of `version`'s Compose archive, or of a placeholder while it
 * cannot be named.
 */
const getReleaseCode = (version: string) => `PUBLIRA_VERSION=${version}
curl -fsSLO \\
  https://github.com/publira/publira/releases/download/v$PUBLIRA_VERSION/publira-deploy-$PUBLIRA_VERSION.tar.gz
tar -xzf publira-deploy-$PUBLIRA_VERSION.tar.gz
cd publira-deploy-$PUBLIRA_VERSION

# Write .env from .env.example, with every secret generated
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/work -w /work \\
  ghcr.io/publira/publiractl:$PUBLIRA_VERSION env generate`;

const code = (chunks: ReactNode) => <code>{chunks}</code>;
const paragraph = (chunks: ReactNode) => <p>{chunks}</p>;

interface StartProps {
  readonly guideHref: string;
  readonly release: string | null;
}

/** The newest release's download and links, with a placeholder until read. */
const Start = async ({ guideHref, release }: StartProps) => {
  const t = await getTranslations();
  const version = release ?? "<version>";

  return (
    <>
      <div className="max-w-3xl space-y-4">
        <CodeBlock
          code={getReleaseCode(version)}
          label={t("start.releaseLabel")}
          lang="shell"
        />
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          {t.rich("start.release", { code, p: paragraph, version })}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="bg-primary text-primary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
          href={guideHref}
        >
          {t("start.guide")}
        </Link>
        <a
          className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
          href={
            release
              ? `https://github.com/publira/publira/releases/tag/v${release}`
              : "https://github.com/publira/publira/releases/latest"
          }
          rel="noreferrer"
          target="_blank"
        >
          {t("start.releaseNotes", { version: release ?? "none" })}
        </a>
        <a
          className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
          href="https://github.com/publira/publira/blob/main/CONTRIBUTING.md"
          rel="noreferrer"
          target="_blank"
        >
          {t("start.contributing")}
        </a>
      </div>
    </>
  );
};

const ReleaseStart = async () => {
  "use cache: remote";

  if (skipGitHubInBuild()) {
    return null;
  }

  const [guide, { release, resolved }] = await Promise.all([
    resolveCurrentDocsPath(["deployments"]),
    resolveLatestRelease(),
  ]);

  if (guide.resolved && resolved) {
    cacheLife("max");
  } else {
    cacheLife("minutes");
  }

  return <Start guideHref={guide.path} release={release} />;
};

export const GetStarted = () => (
  <Suspense fallback={<Start guideHref="/docs" release={null} />}>
    <ReleaseStart />
  </Suspense>
);
