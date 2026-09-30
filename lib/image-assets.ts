import { cacheLife } from "next/cache";

import { organizationAvatarUrl } from "#lib/site";

const fetchOk = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return response;
};

/** A Google Fonts face, cut down to the glyphs that `text` draws. */
export const loadGoogleFont = async (family: string, text: string) => {
  "use cache";
  cacheLife("max");

  const query = new URLSearchParams({ family, text });
  const stylesheet = await fetchOk(
    `https://fonts.googleapis.com/css2?${query}`
  );
  const css = await stylesheet.text();
  const [source] =
    /(?<=src: url\()[^)]+(?=\) format\('truetype'\))/u.exec(css) ?? [];
  if (!source) {
    throw new Error(`Google Fonts served no TrueType face for ${family}`);
  }

  const font = await fetchOk(source);
  return font.arrayBuffer();
};

/** The GitHub organization's avatar as a data URL. */
export const loadOrganizationAvatar = async () => {
  "use cache";
  cacheLife("max");

  const response = await fetchOk(organizationAvatarUrl);
  const type = response.headers.get("content-type") ?? "image/png";
  const data = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:${type};base64,${data}`;
};
